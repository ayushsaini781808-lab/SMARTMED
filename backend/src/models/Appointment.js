const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.UUID, allowNull: false },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  slotId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  tokenNumber: { type: DataTypes.INTEGER, allowNull: false }, // resets daily per doctor
  status: {
    type: DataTypes.ENUM('booked', 'waiting', 'consulting', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'booked'
  },
  symptomSummary: { type: DataTypes.TEXT, allowNull: true },
  suggestedSpecialist: { type: DataTypes.STRING, allowNull: true },
  bookedVia: { type: DataTypes.ENUM('online', 'reception'), defaultValue: 'online' },
  consultStartedAt: { type: DataTypes.DATE, allowNull: true },
  consultEndedAt: { type: DataTypes.DATE, allowNull: true },
  paymentStatus: { type: DataTypes.ENUM('pending', 'pay_at_hospital', 'paid_dummy'), defaultValue: 'pay_at_hospital' }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [{ fields: ['doctorId', 'date'] }, { fields: ['patientId'] }]
});

module.exports = Appointment;
