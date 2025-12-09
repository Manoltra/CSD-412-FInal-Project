"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("budget_table", [
      {
        userId: 1,
        amount: 100.0,
        budget: 500.0,
        expense: "Groceries",
        cost: 100.0,
        description: "Weekly grocery shopping",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        amount: 50.0,
        budget: 300.0,
        expense: "Utilities",
        cost: 50.0,
        description: "Electricity bill",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3,
        amount: 200.0,
        budget: 1000.0,
        expense: "Rent",
        cost: 200.0,
        description: "Monthly rent payment",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("budget_table", null, {});
  },
};