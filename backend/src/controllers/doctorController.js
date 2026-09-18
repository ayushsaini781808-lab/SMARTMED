const { Doctor, User, Slot, Appointment } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, sendSms } = require('../utils/notify');

// Admin creates a doctor profile for an existing (or new) user account.
async function createDoctor(req, res, next) {
  try {
    const { userId, specialization, department, avgConsultMinutes, bio } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'doctor';
    await user.save();

    const doctor = await Doctor.create({ userId, specialization, department, avgConsultMinutes, bio });
    res.status(201).json(doctor);
  } catch (err) { next(err); }
}

async function listDoctors(req, res, next) {
  try {
    const { department, specialization } = req.query;
    const where = {};
    if (department) where.department = department;
    if (specialization) where.specialization = specialization;

    const doctors = await Doctor.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    res.json(doctors);
  } catch (err) { next(err); }
}

async function getDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) { next(err); }
}

// FR-B2: Doctor defines slots for a date range (simple generator - every day
// between startDate/endDate, slots of `slotMinutes` between startTime/endTime).
async function generateSlots(req, res, next) {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate, startTime, endTime, slotMinutes = 15, capacity = 1 } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const created = [];
    let cur = new Date(startDate);
    const end = new Date(endDate);

    while (cur <= end) {
      const dateStr = cur.toISOString().slice(0, 10);
      let [h, m] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      while (h < endH || (h === endH && m < endM)) {
        const sStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        m += slotMinutes;
        while (m >= 60) { m -= 60; h += 1; }
        const eStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const slot = await Slot.create({ doctorId, date: dateStr, startTime: sStr, endTime: eStr, capacity });
        created.push(slot);
      }
      cur.setDate(cur.getDate() + 1);
    }

    res.status(201).json({ count: created.length, slots: created });
  } catch (err) { next(err); }
}

// Patients browsing a doctor's calendar (FR-B2) - full slots greyed out on the frontend.
async function listSlots(req, res, next) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    const where = { doctorId };
    if (date) where.date = date;
    const slots = await Slot.findAll({ where, order: [['date', 'ASC'], ['startTime', 'ASC']] });
    res.json(slots);
  } catch (err) { next(err); }
}

// FR-E1: Bulk cancel - toggling "Doctor on Leave" cancels all future slots/appointments
// and notifies affected patients.
async function toggleLeave(req, res, next) {
  try {
    const { doctorId } = req.params;
    const { onLeave, reason } = req.body;

    const doctor = await Doctor.findByPk(doctorId, { include: [{ model: User, as: 'user' }] });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    doctor.onLeave = !!onLeave;
    await doctor.save();

    if (doctor.onLeave) {
      const today = new Date().toISOString().slice(0, 10);
      const futureSlots = await Slot.findAll({ where: { doctorId, date: { [Op.gte]: today } } });
      const slotIds = futureSlots.map(s => s.id);

      await Slot.update({ status: 'cancelled' }, { where: { id: slotIds } });

      const appts = await Appointment.findAll({
        where: { doctorId, date: { [Op.gte]: today }, status: { [Op.in]: ['booked', 'waiting'] } },
        include: [{ model: User, as: 'patient' }]
      });

      for (const appt of appts) {
        appt.status = 'cancelled';
        await appt.save();
        const msg = `Your appointment with Dr. ${doctor.user.name} on ${appt.date} has been cancelled` +
          (reason ? ` (${reason})` : '') + '. Please rebook at your convenience.';
        await sendEmail(appt.patient.email, 'Appointment Cancelled - SmartMed', msg);
        if (appt.patient.phone) await sendSms(appt.patient.phone, msg);
      }

      return res.json({ ok: true, cancelledSlots: slotIds.length, notifiedPatients: appts.length });
    }

    res.json({ ok: true, onLeave: doctor.onLeave });
  } catch (err) { next(err); }
}

module.exports = { createDoctor, listDoctors, getDoctor, generateSlots, listSlots, toggleLeave };
