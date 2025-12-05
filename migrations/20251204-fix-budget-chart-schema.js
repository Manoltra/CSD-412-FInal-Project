"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('BudgetCharts', 'category', 'expense');

    await queryInterface.renameColumn('BudgetCharts', 'amount', 'cost');

    await queryInterface.changeColumn('BudgetCharts', 'budget', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('BudgetCharts', 'expense', 'category');

    await queryInterface.renameColumn('BudgetCharts', 'cost', 'amount');

    await queryInterface.changeColumn('BudgetCharts', 'budget', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};