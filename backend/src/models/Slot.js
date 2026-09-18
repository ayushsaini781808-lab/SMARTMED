const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A Slot represents one bookable time-window for a doctor on a specific date.
// Generated from the doctor's weekly recurring template (see slotGenerator util).
const Slot = sequelize.define('Slot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false }, // "09:00"
  endTime: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  bookedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('open', 'full', 'cancelled'), defaultValue: 'open' }
}, {
  tableName: 'slots',
  timestamps: true,
  indexes: [{ fields: ['doctorId', 'date'] }]
});

module.exports = Slot;
