const form = document.getElementById("addExpenseForm");
const expenseNameInput = document.getElementById("expenseName");
const costInput = document.getElementById("cost");
const descriptionInput = document.getElementById("description");
const tableBody = document.getElementById("userexpenses");
const totalCostCell = document.getElementById("totalCost");
const budgetField = document.getElementById("budget");
const budgetStatusCell = document.getElementById("budgetStatus");

let total = 0;
let budget = parseFloat(budgetField.textContent) || 0;

// Helper to update budget status
function updateBudgetStatus() {
  const overUnder = budget - total;
  budgetStatusCell.textContent =
    overUnder >= 0 ? `+$${overUnder.toFixed(2)}` : `-$${Math.abs(overUnder).toFixed(2)}`;
}

// Update budget when user edits the field
budgetField.addEventListener("input", () => {
  const val = parseFloat(budgetField.textContent);
  if (!isNaN(val)) {
    budget = val;
    updateBudgetStatus();
  }
});

// Function to render table row
function addExpenseRow(name, cost, description) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${name}</td>
    <td>$${cost.toFixed(2)}</td>
    <td>${description}</td>
    <td><button class="deleteBtn">X</button></td>
  `;

  tableBody.appendChild(row);

  // Update total
  total += cost;
  totalCostCell.textContent = `$${total.toFixed(2)}`;
  updateBudgetStatus();

  // Delete logic
  row.querySelector(".deleteBtn").addEventListener("click", () => {
    tableBody.removeChild(row);
    total -= cost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();
  });
}

// Handle form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = expenseNameInput.value.trim();
  const cost = parseFloat(costInput.value);
  const description = descriptionInput.value.trim();

  if (!name || isNaN(cost)) {
    document.getElementById("errormsg").textContent =
      "Please enter a valid name and cost.";
    return;
  }

  document.getElementById("errormsg").textContent = "";

  addExpenseRow(name, cost, description);

  // Clear form
  expenseNameInput.value = "";
  costInput.value = "";
  descriptionInput.value = "";
});