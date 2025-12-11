const sequelize = require("../database"); // your sequelize instance
const { QueryTypes } = require("sequelize");

(async () => {
    try {
        // Step 1: Rename old table to preserve data
        await sequelize.query(`ALTER TABLE budget_table RENAME TO budget_items_old;`);
        console.log("Renamed budget_table -> budget_items_old");

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

        const defaultUserId = defaultUser[0].id;
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

        const defaultBudgetId = defaultBudget[0].id;
        console.log("Created default budget table with id:", defaultBudgetId);

        // Step 5: Migrate old items into new budget_items table
        const oldItems = await sequelize.query(`SELECT * FROM budget_items_old;`, {
            type: QueryTypes.SELECT
        });

        for (const item of oldItems) {
            await sequelize.query(
                `INSERT INTO budget_items (budgetId, name, cost, description, createdAt, updatedAt)
         VALUES ($budgetId, $name, $cost, $description, $createdAt, $updatedAt)`,
                {
                    bind: {
                        budgetId: defaultBudgetId,
                        name: item.expense,
                        cost: item.cost,
                        description: item.description || "",
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt
                    }
                }
            );
        }

        console.log(`Migrated ${oldItems.length} items to new budget_items table`);

        console.log("Migration complete! 🎉");
        process.exit(0);

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
})();
