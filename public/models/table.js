const form = document.getElementById("addExpenseForm");
const expenseNameInput = document.getElementById("expenseName");
const costInput = document.getElementById("cost");
const descriptionInput = document.getElementById("description");
const tableBody = document.getElementById("userexpenses");
const totalCostCell = document.getElementById("totalCost");
const budgetField = document.getElementById("budget");
const budgetStatusCell = document.getElementById("budgetStatus");
const errorMsg = document.getElementById("errormsg");

// Assume we have a current budget table ID
const budgetTableId = 1; // TODO: dynamically set based on loaded budget
let total = 0;
let budget = parseFloat(budgetField.textContent) || 0;

// -----------------------------
// Budget Logic
// -----------------------------
function updateBudgetStatus() {
  const overUnder = budget - total;
  budgetStatusCell.textContent =
    overUnder >= 0
      ? `+$${overUnder.toFixed(2)}`
      : `-$${Math.abs(overUnder).toFixed(2)}`;
}

budgetField.addEventListener("input", () => {
  const val = parseFloat(budgetField.textContent);
  if (!isNaN(val)) {
    budget = val;
    updateBudgetStatus();
  }
});

// -----------------------------
// Render Row
// -----------------------------
function addExpenseRow(name, cost, description, id = null) {
  const row = document.createElement("tr");
  row.dataset.id = id;

  row.innerHTML = `
    <td>${name}</td>
    <td>$${cost.toFixed(2)}</td>
    <td>${description || ""}</td>
    <td><button class="deleteBtn">X</button></td>
  `;

  tableBody.appendChild(row);

  total += cost;
  totalCostCell.textContent = `$${total.toFixed(2)}`;
  updateBudgetStatus();

  row.querySelector(".deleteBtn").addEventListener("click", async () => {
    if (!id) {
      tableBody.removeChild(row);
      total -= cost;
      updateBudgetStatus();
      return;
    }

    try {
      const res = await fetch(`/api/budget-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      tableBody.removeChild(row);
      total -= cost;
      updateBudgetStatus();
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Failed to delete expense from server.";
    }
  });
}

// -----------------------------
// Load expenses for this budget
// -----------------------------
async function loadExpenses() {
  try {
    const res = await fetch(`/api/budget-items/${budgetTableId}`);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    const expenses = await res.json();

    total = 0;
    tableBody.innerHTML = "";

    expenses.forEach(exp => {
      addExpenseRow(exp.name, parseFloat(exp.cost), exp.description, exp.id);
      total += parseFloat(exp.cost);
    });

    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Failed to load expenses from server.";
  }
}

document.addEventListener("DOMContentLoaded", loadExpenses);

// -----------------------------
// Submit new expense
// -----------------------------
form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = expenseNameInput.value.trim();
  const cost = parseFloat(costInput.value);
  const description = descriptionInput.value.trim();

  if (!name || isNaN(cost)) {
    errorMsg.textContent = "Please enter a valid name and cost.";
    return;
  }

  errorMsg.textContent = "";

  const payload = {
    budgetId: budgetTableId,
    name,
    cost,
    description
  };

  try {
    const res = await fetch("/api/budget-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save expense");
    const savedExpense = await res.json();

    addExpenseRow(savedExpense.name, parseFloat(savedExpense.cost), savedExpense.description, savedExpense.id);

    expenseNameInput.value = "";
    costInput.value = "";
    descriptionInput.value = "";

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Failed to save expense.";
  }
});