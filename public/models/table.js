const form = document.getElementById("addExpenseForm");
const expenseNameInput = document.getElementById("expenseName");
const costInput = document.getElementById("cost");
const descriptionInput = document.getElementById("description");
const tableBody = document.getElementById("userexpenses");
const totalCostCell = document.getElementById("totalCost");
const budgetField = document.getElementById("budget");
const budgetStatusCell = document.getElementById("budgetStatus");
const errorMsg = document.getElementById("errormsg");

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

  // Delete button
row.querySelector(".deleteBtn").addEventListener("click", async () => {
  if (id !== null) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete from server");

      // Only remove from DOM and total if deletion succeeds
      tableBody.removeChild(row);
      total -= cost;
      totalCostCell.textContent = `$${total.toFixed(2)}`;
      updateBudgetStatus();

    } catch (err) {
      console.error("Failed to delete expense:", err);
      errorMsg.textContent = "Failed to delete expense from server.";
    }
  } else {
    // fallback: just remove from table if no id (should rarely happen)
    tableBody.removeChild(row);
    total -= cost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();
  }
});

}

// -----------------------------
// Load initial expenses (if any)
// -----------------------------
async function loadExpenses() {
  try {
    const res = await fetch("/api/expenses");
    if (!res.ok) throw new Error("Failed to fetch expenses");
    const expenses = await res.json(); // <-- get JSON from database

    let totalCost = 0;

    expenses.forEach(exp => {
      addExpenseRow(exp.expense, parseFloat(exp.cost), exp.description, exp.id);
      totalCost += parseFloat(exp.cost);
    });

    total = totalCost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();

  } catch (err) {
    console.error("Failed to load expenses:", err);
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
    userId: 1,          // adjust when you add auth
    expense: name,
    cost: cost,
    description: description,
    budget: parseFloat(budgetField.textContent) || 0
  };

  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save expense");
    const savedExpense = await res.json();

    addExpenseRow(savedExpense.expense, parseFloat(savedExpense.cost), savedExpense.description, savedExpense.id);

    // Clear form
    expenseNameInput.value = "";
    costInput.value = "";
    descriptionInput.value = "";

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Failed to save expense.";
  }
});

