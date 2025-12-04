const form = document.getElementById("addExpenseForm");
const expenseNameInput = document.getElementById("expenseName");
const costInput = document.getElementById("cost");
const descriptionInput = document.getElementById("description");
const tableBody = document.getElementById("userexpenses");
const totalCostCell = document.getElementById("totalCost");

let total = 0;

form.addEventListener("submit", function (e) {
  e.preventDefault(); // Stop page reload

  const name = expenseNameInput.value.trim();
  const cost = parseFloat(costInput.value);
  const description = descriptionInput.value.trim();

  if (!name || isNaN(cost)) {
    document.getElementById("errormsg").textContent = "Please enter a valid name and cost.";
    return;
  }

  document.getElementById("errormsg").textContent = "";

  // Create row
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

  // Delete button logic
  row.querySelector(".deleteBtn").addEventListener("click", function () {
    tableBody.removeChild(row);
    total -= cost;
    totalCostCell.textContent = `$${total.toFixed(2)}`;
  });

  // Clear form
  expenseNameInput.value = "";
  costInput.value = "";
  descriptionInput.value = "";
});