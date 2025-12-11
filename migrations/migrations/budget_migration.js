'use strict';

const { QueryTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    try {
      // Check if the budget_table exists before renaming
      const tableExists = await sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'budget_table'
        );`,
        { type: QueryTypes.SELECT }
      );

      if (tableExists[0].exists) {
        // Rename old table to preserve data
        await sequelize.query(`ALTER TABLE budget_table RENAME TO budget_items_old;`);
        console.log("Renamed budget_table -> budget_items_old");
      }

      // Step 2: Create new tables
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP DEFAULT NOW(),
          updatedAt TIMESTAMP DEFAULT NOW()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS budget_tables (
          id SERIAL PRIMARY KEY,
          userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          budget FLOAT NOT NULL,
          description VARCHAR(255),
          createdAt TIMESTAMP DEFAULT NOW(),
          updatedAt TIMESTAMP DEFAULT NOW()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS budget_items (
          id SERIAL PRIMARY KEY,
          budgetId INTEGER REFERENCES budget_tables(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          cost FLOAT NOT NULL,
          description VARCHAR(255),
          createdAt TIMESTAMP DEFAULT NOW(),
          updatedAt TIMESTAMP DEFAULT NOW()
        );
      `);

      console.log("Created new tables: users, budget_tables, budget_items");

      // Step 3: Insert default user
      const [defaultUser] = await sequelize.query(
        `INSERT INTO users (username, password) VALUES ('default_user', 'changeme') RETURNING id;`,
        { type: QueryTypes.INSERT }
      );

      const defaultUserId = defaultUser.id || defaultUser[0]?.id; // Ensure correct retrieval of the ID
      console.log("Inserted default user with id:", defaultUserId);

      // Step 4: Create a default budget table
      const [defaultBudget] = await sequelize.query(
        `INSERT INTO budget_tables (userId, name, budget, description)
         VALUES ($userId, 'Migrated Budget', 0, 'Imported from old table')
         RETURNING id;`,
        {
          bind: { userId: defaultUserId },
          type: QueryTypes.INSERT
        }
      );

      const defaultBudgetId = defaultBudget.id;
      console.log("Created default budget table with id:", defaultBudgetId);
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    try {
      // Drop the new tables
      await sequelize.query(`DROP TABLE IF EXISTS budget_items;`);
      await sequelize.query(`DROP TABLE IF EXISTS budget_tables;`);
      await sequelize.query(`DROP TABLE IF EXISTS users;`);

      // Rename the old table back
      await sequelize.query(`ALTER TABLE budget_items_old RENAME TO budget_table;`);
    } catch (error) {
      console.error("Rollback failed:", error);
      throw error;
    }
  }
};
