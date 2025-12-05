const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const BudgetChart = sequelize.define('BudgetTable', {
userId: { type: DataTypes.INTEGER, allowNull: false },
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  budget: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  expense: { type: DataTypes.STRING, allowNull: false },
  cost: { type: DataTypes.FLOAT, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.STRING },
}, {
  tableName: 'budget_table',
  timestamps: true
});

module.exports = BudgetChart;