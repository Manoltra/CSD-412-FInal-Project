const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const BudgetChart = sequelize.define('BudgetChart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  budget: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  expense: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'budget_table',
  timestamps: true,
});

module.exports = BudgetChart;