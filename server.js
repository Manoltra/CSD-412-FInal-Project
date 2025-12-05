// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// -----------------------------
// Frontend fallback routes
// -----------------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/charts', (req, res) => res.sendFile(path.join(__dirname, 'public', 'charts.html')));

// -----------------------------
// Start server
// -----------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});