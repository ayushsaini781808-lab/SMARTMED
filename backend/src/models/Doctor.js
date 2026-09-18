const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  specialization: { type: DataTypes.STRING, allowNull: false }, // e.g. Neurologist, Cardiologist
  department: { type: DataTypes.STRING, allowNull: false },
  avgConsultMinutes: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 10 },
  onLeave: { type: DataTypes.BOOLEAN, defaultValue: false },
  bio: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'doctors',
  timestamps: true
});

module.exports = Doctor;
