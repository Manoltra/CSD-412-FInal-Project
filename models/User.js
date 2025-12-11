const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(255), allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: "users",
  timestamps: true
});

module.exports = User;