// server.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const sequelize = require('./database');
const bcrypt = require("bcrypt");
const User = require('./models/User');
const BudgetTable = require('./models/BudgetTable');
const BudgetItem = require('./models/BudgetItem');

// -----------------------------
// Sync the database
// -----------------------------
(async () => {
  try {
    await sequelize.sync({ alter: true }); // Update tables if needed
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

// -----------------------------
// API Routes
// -----------------------------

// -------- Users --------

// Create a user
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Invalid data" });

  try {
    const user = await User.create({ username, password });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// -------- Budget Tables --------

// Get all budget tables for a user
app.get('/api/budget-tables/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const tables = await BudgetTable.findAll({
      where: { userId },
      include: [BudgetItem],
      order: [['createdAt', 'ASC']]
    });
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budget tables" });
  }
});

// Create a new budget table with items
app.post('/api/budget-tables', async (req, res) => {
  const { userId, name, budget, description, items } = req.body;
  if (!userId || !name || !Array.isArray(items)) return res.status(400).json({ error: "Invalid data" });

  try {
    const budgetTable = await BudgetTable.create({ userId, name, budget, description });

    for (const item of items) {
      await BudgetItem.create({
        budgetId: budgetTable.id,
        name: item.name,
        cost: item.cost,
        description: item.description || null
      });
    }

    const tableWithItems = await BudgetTable.findByPk(budgetTable.id, { include: [BudgetItem] });
    res.json(tableWithItems);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create budget table" });
  }
});

// Delete a budget table and all its items
app.delete('/api/budget-tables/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deleted = await BudgetTable.destroy({ where: { id } });
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: "Budget table not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete budget table" });
  }
});

// -------- Budget Items --------

// Get all items for a budget table
app.get('/api/budget-items/:budgetId', async (req, res) => {
  const budgetId = parseInt(req.params.budgetId);
  try {
    const items = await BudgetItem.findAll({ where: { budgetId } });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budget items" });
  }
});

// Create a single budget item
app.post('/api/budget-items', async (req, res) => {
  const { budgetId, name, cost, description } = req.body;
  if (!budgetId || !name || cost === undefined) return res.status(400).json({ error: "Invalid data" });

  try {
    const item = await BudgetItem.create({ budgetId, name, cost, description });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create budget item" });
  }
});

// Delete a single budget item
app.delete('/api/budget-items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deleted = await BudgetItem.destroy({ where: { id } });
    if (deleted) res.json({ success: true });
    else res.status(404).json({ error: "Budget item not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete budget item" });
  }
});

// -----------------------------
// Start server
// -----------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// ------------------
// Signup
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ------------------
// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid username or password" });

    // For now, store user ID in session or return as a token
    // Example: send user ID to frontend (you can switch to JWT or express-session)
    res.json({ success: true, userId: user.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

