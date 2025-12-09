const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const User = require("./User");

const BudgetTable = sequelize.define("BudgetTable", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  budget: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.STRING }
}, {
  tableName: "budget_tables",
  timestamps: true
});

User.hasMany(BudgetTable, { foreignKey: "userId", onDelete: "CASCADE" });
BudgetTable.belongsTo(User, { foreignKey: "userId" });

module.exports = BudgetTable;
