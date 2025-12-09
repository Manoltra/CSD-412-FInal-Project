// server.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const BudgetTable = require('./models/BudgetTable');
const sequelize = require('./database');

// Sync the database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced');
  } catch (err) {
    console.error('DB sync error:', err);
  }
})();

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json());
app.use(express.static('public'));

// -----------------------------
// Frontend fallback routes
// -----------------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/charts', (req, res) => res.sendFile(path.join(__dirname, 'public', 'charts.html')));

//-----------------------------
//API Routes
//-----------------------------
// GET all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await BudgetTable.findAll({ order: [['createdAt', 'ASC']] });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, expense, cost, description, amount } = req.body;
    const newExpense = await BudgetTable.create({ userId, expense, cost, description, amount });
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await BudgetTable.destroy({ where: { id } });
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: 'Expense not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.post("/api/budget-lists", async (req, res) => {
  const { name, budget, total, expenses } = req.body;

  if (!name || !Array.isArray(expenses)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert list
    const listRes = await client.query(
      `INSERT INTO budget_lists (name, budget, total)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, budget, total]
    );

    const listId = listRes.rows[0].id;

    // Insert each expense item
    for (const exp of expenses) {
      await client.query(
        `INSERT INTO budget_list_items (list_id, expense, cost, description)
         VALUES ($1, $2, $3, $4)`,
        [listId, exp.expense, exp.cost, exp.description]
      );
    }

    await client.query("COMMIT");

    res.json({ success: true, listId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving budget list:", err);
    res.status(500).json({ error: "Server error while saving list" });

  } finally {
    client.release();
  }
});



// -----------------------------
// Start server
// -----------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});