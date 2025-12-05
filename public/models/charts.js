(async function() {
  const ctx = document.getElementById('myChart').getContext('2d');

  // Fetch your data from the server
  const response = await fetch('/api/expenses');
  const expenses = await response.json();

  // Extract labels and data
  const labels = expenses.map(item => item.expense);
  const data = expenses.map(item => item.cost);

  // Function to generate random colors
  function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const backgroundColors = expenses.map(() => getRandomColor());

  // Create the chart
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses',
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
})();
