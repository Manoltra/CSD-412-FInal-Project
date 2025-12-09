let budgetLists = [];
const tableBody = document.querySelector("#budgetTable tbody");

document.addEventListener("DOMContentLoaded", loadBudgetLists);

async function loadBudgetLists() {
  try {
    const res = await fetch("/api/budget-tables");
    if (!res.ok) throw new Error("Failed to load budget tables");

    budgetLists = await res.json(); // [{id, name, budget}, ...]
    renderTable();
  } catch (err) {
    console.error("Error loading budget tables:", err);
  }
}

function renderTable() {
  tableBody.innerHTML = "";

  budgetLists.forEach(list => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${list.name}</td>
      <td>$${Number(list.budget).toFixed(2)}</td>
      <td><button class="load-btn">Load</button></td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    const loadBtn = row.querySelector(".load-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    loadBtn.addEventListener("click", () => loadBudget(list.id));
    deleteBtn.addEventListener("click", () => deleteBudget(list.id));

    tableBody.appendChild(row);
  });
}

function loadBudget(id) {
  window.location.href = `/budget.html?id=${id}`;
}

async function deleteBudget(id) {
  if (!confirm("Are you sure you want to delete this budget list?")) return;

  try {
    const res = await fetch(`/api/budget-tables/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");

    budgetLists = budgetLists.filter(list => list.id !== id);
    renderTable();
  } catch (err) {
    console.error("Failed to delete budget table:", err);
    alert("Could not delete the budget table.");
  }
}
