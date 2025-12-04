const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const BudgetChart = sequelize.define('BudgetChart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = BudgetChart;