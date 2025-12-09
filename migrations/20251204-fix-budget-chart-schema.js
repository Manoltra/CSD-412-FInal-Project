"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Example fix: Ensure all columns are correctly defined
    await queryInterface.changeColumn("budget_table", "budget", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes made in the up method
    await queryInterface.changeColumn("budget_table", "budget", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};