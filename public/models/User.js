let budgetLists = [];

const tableBody = document.querySelector("#budgetTable tbody");

// Load all lists from server when page loads
document.addEventListener("DOMContentLoaded", loadBudgetLists);

// Fetch all budget lists from backend
async function loadBudgetLists() {
    try {
        const res = await fetch("/api/budget-lists");
        if (!res.ok) throw new Error("Failed to load budget lists");

        budgetLists = await res.json(); // [{id, name, budget, total}, ...]

        renderTable();
    } catch (err) {
        console.error("Error loading budget lists:", err);
    }
}

function renderTable() {
    tableBody.innerHTML = "";

    budgetLists.forEach(list => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${list.name}</td>
            <td>$${Number(list.budget).toFixed(2)}</td>
            <td><button class="load-btn" onclick="loadBudget(${list.id})">Load</button></td>
            <td><button class="delete-btn" onclick="deleteBudget(${list.id})">Delete</button></td>
        `;

        tableBody.appendChild(row);
    });
}

// Load a list (redirect or change page)
function loadBudget(id) {
    // You will probably redirect to your budget builder page
    window.location.href = `/budget.html?id=${id}`;
}

// Delete a list
async function deleteBudget(id) {
    if (!confirm("Are you sure you want to delete this budget list?"))
        return;

    try {
        const res = await fetch(`/api/budget-lists/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");

        // Remove from local array
        budgetLists = budgetLists.filter(list => list.id !== id);

        // Re-render
        renderTable();

    } catch (err) {
        console.error("Failed to delete list:", err);
        alert("Could not delete the budget list.");
    }
}
