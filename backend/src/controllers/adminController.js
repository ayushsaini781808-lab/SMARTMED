const { User, Doctor, Appointment } = require('../models');
const { Op, fn, col } = require('sequelize');
const { getLog } = require('../utils/notify');

async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.findAll({ where, attributes: { exclude: ['passwordHash', 'refreshToken'] } });
    res.json(users);
  } catch (err) { next(err); }
}

async function listDepartments(req, res, next) {
  try {
    const rows = await Doctor.findAll({ attributes: [[fn('DISTINCT', col('department')), 'department']] });
    res.json(rows.map(r => r.get('department')));
  } catch (err) { next(err); }
}

// FR: Admin daily report - bookings, completions, cancellations, per department.
async function dailyReport(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const appts = await Appointment.findAll({
      where: { date },
      include: [{ model: Doctor, as: 'doctor' }]
    });

    const summary = {
      date,
      totalBookings: appts.length,
      completed: appts.filter(a => a.status === 'completed').length,
      cancelled: appts.filter(a => a.status === 'cancelled').length,
      inQueue: appts.filter(a => ['booked', 'waiting'].includes(a.status)).length,
      consulting: appts.filter(a => a.status === 'consulting').length,
      byDepartment: {}
    };

    for (const a of appts) {
      const dept = a.doctor?.department || 'Unknown';
      summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
    }

    res.json(summary);
  } catch (err) { next(err); }
}

async function notificationLog(req, res, next) {
  res.json(getLog());
}

// Admin/reception can book on behalf of a walk-in patient by first creating a
// lightweight patient account, reusing the same booking flow afterward.
async function createWalkInPatient(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email, phone, role: 'patient' });
    }
    res.status(201).json(user);
  } catch (err) { next(err); }
}

module.exports = { listUsers, listDepartments, dailyReport, notificationLog, createWalkInPatient };
