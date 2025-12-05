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
let expenses = []; // In-memory array

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
  row.querySelector(".deleteBtn").addEventListener("click", () => {
    tableBody.removeChild(row);
    total -= cost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();

    // Remove from in-memory array
    if (id !== null) {
      expenses = expenses.filter(e => e.id !== id);
    }
  });
}

// -----------------------------
// Load initial expenses (if any)
// -----------------------------
function loadExpenses() {
  expenses.forEach(exp => {
    addExpenseRow(exp.name, exp.cost, exp.description, exp.id);
  });
}

document.addEventListener("DOMContentLoaded", loadExpenses);

// -----------------------------
// Submit new expense
// -----------------------------
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = expenseNameInput.value.trim();
  const cost = parseFloat(costInput.value);
  const description = descriptionInput.value.trim();

  if (!name || isNaN(cost)) {
    errorMsg.textContent = "Please enter a valid name and cost.";
    return;
  }

  errorMsg.textContent = "";

  // Create a new expense object
  const newExpense = {
    id: expenses.length ? expenses[expenses.length - 1].id + 1 : 1,
    name,
    cost,
    description
  };

  expenses.push(newExpense); // Save in-memory
  addExpenseRow(name, cost, description, newExpense.id);

  // Clear form
  expenseNameInput.value = "";
  costInput.value = "";
  descriptionInput.value = "";
});
