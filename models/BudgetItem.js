const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const BudgetTable = require("./BudgetTable");

const BudgetItem = sequelize.define("BudgetItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  cost: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: "budget_items",
  timestamps: true
});

BudgetTable.hasMany(BudgetItem, { foreignKey: "budgetId", onDelete: "CASCADE" });
BudgetItem.belongsTo(BudgetTable, { foreignKey: "budgetId" });

module.exports = BudgetItem;