const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Slot = require('./Slot');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Waitlist = require('./Waitlist');

// Associations
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });

Slot.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Doctor.hasMany(Slot, { foreignKey: 'doctorId', as: 'slots' });

Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(Slot, { foreignKey: 'slotId', as: 'slot' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });

Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });

Waitlist.belongsTo(Slot, { foreignKey: 'slotId', as: 'slot' });
Waitlist.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

module.exports = { sequelize, User, Doctor, Slot, Appointment, Prescription, Waitlist };
