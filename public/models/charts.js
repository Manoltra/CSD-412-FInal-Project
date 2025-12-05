const ctx = document.getElementById('myChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'Expenses',
      backgroundColor: [
        'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
      ],
      data: [0, 10, 5, 2, 20, 30, 45]
    }]
  },
  options: {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: { beginAtZero: true }
      }]
    }
  }
});