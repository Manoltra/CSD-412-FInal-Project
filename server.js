const express = require('express');
const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1><p>Welcome to the Home Page!</p>');
});

app.get('/about', (req, res) => {
  res.send('<h1>About Page</h1><p>Learn more about us on this page.</p>');
});

app.get('/contact', (req, res) => {
  res.send('<h1>Contact Page</h1><p>Contact us at contact@example.com.</p>');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});