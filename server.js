const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/public/about.html');
});

app.get('/charts', (req, res) => {
  res.sendFile(__dirname + '/public/charts.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
