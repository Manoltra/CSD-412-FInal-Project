"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Example update: Add a new column or modify existing schema
    await queryInterface.addColumn("budget_table", "exampleColumn", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes made in the up method
    await queryInterface.removeColumn("budget_table", "exampleColumn");
  },
};