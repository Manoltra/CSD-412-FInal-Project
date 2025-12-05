const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/public/about.html');
});

app.get('/charts', (req, res) => {
  res.sendFile(__dirname + '/public/charts.html');
});

const BudgetChart = require('./models/BudgetChart');
const sequelize = require('./database');

// Enable Sequelize logging for debugging
sequelize.options.logging = console.log;

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // creates table if it doesn't exist
    console.log('Database synced');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
}

syncDatabase();

app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await BudgetChart.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json(expenses);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, category, amount, budget, expense, cost, description } = req.body;

    const newExpense = await BudgetChart.create({
      userId,
      amount,
      budget,
      expense,
      cost,
      description
    });

    res.json(newExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
