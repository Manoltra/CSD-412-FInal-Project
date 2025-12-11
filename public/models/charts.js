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

const saveBtn = document.getElementById("saveBudgetBtn");
const saveStatus = document.getElementById("saveStatus");

saveBtn.addEventListener("click", async () => {

  // Ask user for name of budget list
  const listName = prompt("Enter a name:");

  if (!listName || listName.trim() === "") {
    alert("Budget name cannot be empty.");
    return;
  }

  // Collect all table rows into an array
  const expenses = Array.from(document.querySelectorAll("#userexpenses tr")).map(row => {
    const cells = row.querySelectorAll("td");

    return {
      expense: cells[0].textContent,
      cost: parseFloat(cells[1].textContent.replace("$", "")),
      description: cells[2].textContent
    };
  });

  const payload = {
    name: listName.trim(),
    budget: budget,
    total: total,
    expenses: expenses
  };

  try {
    const res = await fetch("/api/budget-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save budget list");

    saveStatus.textContent = "Budget list saved!";
    setTimeout(() => (saveStatus.textContent = ""), 3000);

  } catch (err) {
    console.error("Save failed:", err);
    saveStatus.style.color = "red";
    saveStatus.textContent = "Failed to save budget list.";
    setTimeout(() => (saveStatus.textContent = ""), 3000);
  }
});
