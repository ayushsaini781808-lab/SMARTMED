const { sequelize, Slot, Appointment, Doctor, User, Waitlist } = require('../models');
const { Op } = require('sequelize');
const { suggestSpecialist } = require('../utils/symptomChecker');
const { sendEmail, sendSms } = require('../utils/notify');

// FR-B1: AI Pre-Triage endpoint - patient describes symptoms/body parts, gets a
// suggested specialist + matching doctor list before booking.
async function checkSymptoms(req, res, next) {
  try {
    const { symptoms, bodyParts } = req.body;
    if (!symptoms && (!bodyParts || bodyParts.length === 0)) {
      return res.status(400).json({ error: 'Provide symptoms text or bodyParts' });
    }
    const suggestion = suggestSpecialist(symptoms || '', bodyParts || []);
    const matchingDoctors = await Doctor.findAll({
      where: { specialization: suggestion.specialist, onLeave: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });
    res.json({ ...suggestion, matchingDoctors });
  } catch (err) { next(err); }
}

// FR-B3 + FR-C1: Book a slot with row-level locking so two patients can never
// grab the same slot capacity, and generate a daily-incrementing token number
// scoped to (doctor, date).
async function bookAppointment(req, res, next) {
  const { slotId, symptomSummary, suggestedSpecialist, bookedVia } = req.body;
  const patientId = req.user.role === 'admin' && req.body.patientId ? req.body.patientId : req.user.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // SELECT ... FOR UPDATE equivalent in Sequelize: lock: t.LOCK.UPDATE
      const slot = await Slot.findByPk(slotId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!slot) { const e = new Error('Slot not found'); e.status = 404; throw e; }
      if (slot.status === 'cancelled') { const e = new Error('This slot has been cancelled'); e.status = 409; throw e; }
      if (slot.bookedCount >= slot.capacity) { const e = new Error('Slot is fully booked'); e.status = 409; throw e; }

      const doctor = await Doctor.findByPk(slot.doctorId, { transaction: t });
      if (doctor.onLeave) { const e = new Error('Doctor is currently on leave'); e.status = 409; throw e; }

      // Next token number for this doctor+date, computed within the same lock.
      const lastToken = await Appointment.max('tokenNumber', {
        where: { doctorId: slot.doctorId, date: slot.date },
        transaction: t
      });
      const tokenNumber = (lastToken || 0) + 1;

      const appointment = await Appointment.create({
        patientId, doctorId: slot.doctorId, slotId: slot.id, date: slot.date,
        tokenNumber, status: 'booked', symptomSummary, suggestedSpecialist,
        bookedVia: bookedVia || 'online'
      }, { transaction: t });

      slot.bookedCount += 1;
      if (slot.bookedCount >= slot.capacity) slot.status = 'full';
      await slot.save({ transaction: t });

      return appointment;
    });

    const patient = await User.findByPk(patientId);
    await sendEmail(patient.email, 'Appointment Confirmed - SmartMed',
      `Your token number is ${result.tokenNumber} for ${result.date}. You can track the live queue on your dashboard.`);

    res.status(201).json(result);
  } catch (err) { next(err); }
}

// FR-C1/C3: Today's queue for a doctor, with live "patients ahead" + estimated wait.
async function getDoctorQueue(req, res, next) {
  try {
    const { doctorId } = req.params;
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const appointments = await Appointment.findAll({
      where: { doctorId, date, status: { [Op.in]: ['booked', 'waiting', 'consulting'] } },
      include: [{ model: User, as: 'patient', attributes: ['id', 'name'] }],
      order: [['tokenNumber', 'ASC']]
    });

    const withWait = appointments.map((a, idx) => {
      const patientsAhead = appointments.filter((x, i) => i < idx && x.status !== 'completed' && x.status !== 'cancelled').length;
      return { ...a.toJSON(), patientsAhead, estimatedWaitMinutes: patientsAhead * doctor.avgConsultMinutes };
    });

    res.json({ doctorId, date, avgConsultMinutes: doctor.avgConsultMinutes, queue: withWait });
  } catch (err) { next(err); }
}

// Patient's own live position for a specific appointment (drives their dashboard widget).
async function getMyQueuePosition(req, res, next) {
  try {
    const appt = await Appointment.findByPk(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.patientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const doctor = await Doctor.findByPk(appt.doctorId);
    const ahead = await Appointment.count({
      where: {
        doctorId: appt.doctorId, date: appt.date,
        tokenNumber: { [Op.lt]: appt.tokenNumber },
        status: { [Op.in]: ['booked', 'waiting'] }
      }
    });
    res.json({
      appointmentId: appt.id, tokenNumber: appt.tokenNumber, status: appt.status,
      patientsAhead: ahead, estimatedWaitMinutes: ahead * doctor.avgConsultMinutes
    });
  } catch (err) { next(err); }
}

// FR-C2: Doctor clicks "Start" -> broadcast via WebSocket so patient dashboards
// update instantly without a page refresh.
async function startConsultation(req, res, next) {
  try {
    const appt = await Appointment.findByPk(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    appt.status = 'consulting';
    appt.consultStartedAt = new Date();
    await appt.save();

    broadcastQueueUpdate(req, appt.doctorId, appt.date);
    res.json(appt);
  } catch (err) { next(err); }
}

async function completeConsultation(req, res, next) {
  try {
    const appt = await Appointment.findByPk(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    appt.status = 'completed';
    appt.consultEndedAt = new Date();
    await appt.save();

    // Update doctor's rolling average consult time (FR-C3).
    if (appt.consultStartedAt) {
      const minutes = (appt.consultEndedAt - appt.consultStartedAt) / 60000;
      const doctor = await Doctor.findByPk(appt.doctorId);
      doctor.avgConsultMinutes = Math.round(((doctor.avgConsultMinutes * 4) + minutes) / 5 * 10) / 10; // smoothed average
      await doctor.save();
    }

    broadcastQueueUpdate(req, appt.doctorId, appt.date);
    res.json(appt);
  } catch (err) { next(err); }
}

async function cancelAppointment(req, res, next) {
  try {
    const appt = await Appointment.findByPk(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.patientId !== req.user.id && req.user.role === 'patient') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    appt.status = 'cancelled';
    await appt.save();

    const slot = await Slot.findByPk(appt.slotId);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      slot.status = 'open';
      await slot.save();

      // FR-E2: Notify the first waitlisted patient that a spot opened up.
      const nextWaiting = await Waitlist.findOne({
        where: { slotId: slot.id, notified: false },
        order: [['position', 'ASC']],
        include: [{ model: User, as: 'patient' }]
      });
      if (nextWaiting) {
        nextWaiting.notified = true;
        await nextWaiting.save();
        await sendEmail(nextWaiting.patient.email, 'A Slot Opened Up - SmartMed',
          `Good news! A slot you were waitlisted for on ${slot.date} at ${slot.startTime} is now available. Book it quickly before it fills up.`);
        if (nextWaiting.patient.phone) {
          await sendSms(nextWaiting.patient.phone, `SmartMed: A waitlisted slot on ${slot.date} ${slot.startTime} is now open. Book now!`);
        }
      }
    }

    broadcastQueueUpdate(req, appt.doctorId, appt.date);
    res.json(appt);
  } catch (err) { next(err); }
}

// FR-E2: Patient joins the waitlist for a full slot.
async function joinWaitlist(req, res, next) {
  try {
    const { slotId } = req.body;
    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    const count = await Waitlist.count({ where: { slotId } });
    const entry = await Waitlist.create({ patientId: req.user.id, slotId, position: count + 1 });
    res.status(201).json(entry);
  } catch (err) { next(err); }
}

async function myAppointments(req, res, next) {
  try {
    const appts = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [{ model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['date', 'DESC']]
    });
    res.json(appts);
  } catch (err) { next(err); }
}

function broadcastQueueUpdate(req, doctorId, date) {
  const io = req.app.get('io');
  if (io) io.to(`queue:${doctorId}:${date}`).emit('queue:update', { doctorId, date, at: new Date().toISOString() });
}

module.exports = {
  checkSymptoms, bookAppointment, getDoctorQueue, getMyQueuePosition,
  startConsultation, completeConsultation, cancelAppointment, joinWaitlist, myAppointments
};
