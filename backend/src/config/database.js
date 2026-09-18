const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite is used for zero-config local/demo runs (no external DB server required).
// For production, switch dialect to 'postgres' and set DATABASE_URL - the models
// and queries below are Sequelize-standard and require no changes.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../data/smartmed.sqlite'),
      logging: false
    });

module.exports = sequelize;
