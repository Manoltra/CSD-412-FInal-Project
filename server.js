// server.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const BudgetChart = require('./models/BudgetTable');
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
    const expenses = await BudgetChart.findAll({ order: [['createdAt', 'ASC']] });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, expense, cost, description, budget, amount } = req.body;
    const newExpense = await BudgetChart.create({ userId, expense, cost, description, budget, amount });
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await BudgetChart.destroy({ where: { id } });
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: 'Expense not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});


// -----------------------------
// Start server
// -----------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});