const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  passwordHash: { type: DataTypes.STRING, allowNull: true }, // null for OAuth-only users
  googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
  role: { type: DataTypes.ENUM('patient', 'doctor', 'admin'), allowNull: false, defaultValue: 'patient' },
  languagePref: { type: DataTypes.ENUM('en', 'hi'), allowNull: false, defaultValue: 'en' },
  refreshToken: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
