const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  'csd_412_final_project_dev',  // database name
  'admin',                 // username
  'password',                 // password
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: console.log
  }
);

module.exports = sequelize;
