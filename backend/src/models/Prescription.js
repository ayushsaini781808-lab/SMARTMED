const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  appointmentId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.UUID, allowNull: false },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  imagePath: { type: DataTypes.STRING, allowNull: true },
  rawOcrText: { type: DataTypes.TEXT, allowNull: true },
  medicines: { type: DataTypes.TEXT, allowNull: true }, // JSON string: [{name, dosage, frequency}]
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

module.exports = Prescription;
