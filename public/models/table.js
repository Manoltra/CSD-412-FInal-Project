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

/* -----------------------------
   Budget Logic
------------------------------*/
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

/* -----------------------------
   Render Row
------------------------------*/
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

  // ❌ Delete Button
  row.querySelector(".deleteBtn").addEventListener("click", async () => {
    tableBody.removeChild(row);
    total -= cost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
    updateBudgetStatus();

    // OPTIONAL: delete from DB
    if (id) {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    }
  });
}

/* -----------------------------
   Load Expenses From DB
------------------------------*/
async function loadExpenses() {
  try {
    const res = await fetch("/api/expenses");
    const expenses = await res.json();

    expenses.forEach(exp => {
      addExpenseRow(
        exp.expense,
        parseFloat(exp.cost),
        exp.description,
        exp.id
      );
    });
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadExpenses);

/* -----------------------------
   Submit New Expense
------------------------------*/
form.addEventListener("submit", async function (e) {
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
    userId: 1,              // Change when auth is added
    amount: cost,
    budget: budget,
    expense: name,
    cost: cost,
    description: description
  };

  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const savedExpense = await res.json();

    // ✅ Add row with DB ID
    addExpenseRow(
      savedExpense.expense,
      parseFloat(savedExpense.cost),
      savedExpense.description,
      savedExpense.id
    );

    // Clear form
    expenseNameInput.value = "";
    costInput.value = "";
    descriptionInput.value = "";

  } catch (err) {
    console.error("Failed to save expense:", err);
    errorMsg.textContent = "Database error. Try again.";
  }
});