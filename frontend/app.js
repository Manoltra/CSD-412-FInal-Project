// frontend/app.js

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api'; // Use relative path for production/AWS

// Authentication State Management
let currentUser = null;
let authToken = null;

// Weekly tracking state
let currentWeekStart = null;
let currentWeekEnd = null;
let allExpenses = [];
let showWeekOnly = true;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Check if user is already logged in
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (authToken && currentUser) {
        showMainApp();
        loadExpenses();
    } else {
        showAuthSection();
    }
    
    // Set up authentication event listeners
    setupAuthListeners();
}

// Authentication Event Listeners
function setupAuthListeners() {
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// Show/Hide Auth Sections
function showLoginForm() {
    document.getElementById('login-section').classList.add('active');
    document.getElementById('register-section').classList.remove('active');
    clearAuthMessage();
}

function showRegisterForm() {
    document.getElementById('register-section').classList.add('active');
    document.getElementById('login-section').classList.remove('active');
    clearAuthMessage();
}

function showAuthSection() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    // Set user name in header
    if (currentUser) {
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
    }
    
    // Initialize current week
    setCurrentWeek();
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
        dateInput.valueAsDate = new Date();
    }
    
    // Set up expense form listener
    document.getElementById('expense-form').removeEventListener('submit', handleExpenseSubmit);
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
    
    // Set up weekly navigation listeners
    setupWeeklyListeners();
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAuthMessage('Login successful!', 'success');
            
            // Clear form
            document.getElementById('login-form').reset();
            
            // Switch to main app after short delay
            setTimeout(() => {
                showMainApp();
                loadExpenses();
            }, 500);
        } else {
            showAuthMessage(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('Network error. Please check if the server is running.', 'error');
    }
}

// Handle Registration
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAuthMessage('Registration successful!', 'success');
            
            // Clear form
            document.getElementById('register-form').reset();
            
            // Switch to main app after short delay
            setTimeout(() => {
                showMainApp();
                loadExpenses();
            }, 500);
        } else {
            showAuthMessage(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthMessage('Network error. Please check if the server is running.', 'error');
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear storage and state
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        authToken = null;
        currentUser = null;
        
        // Clear expenses list
        document.getElementById('expenses-list').innerHTML = '';
        document.getElementById('total-amount').textContent = 'Total: $0.00';
        
        // Show auth section
        showAuthSection();
        showLoginForm();
    }
}

// Helper function to get auth headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Show auth messages
function showAuthMessage(text, type) {
    const messageDiv = document.getElementById('auth-message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function clearAuthMessage() {
    const messageDiv = document.getElementById('auth-message');
    messageDiv.style.display = 'none';
}

// Handle expense form submission
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    if (!authToken) {
        showMessage('Please login to add expenses', 'error');
        return;
    }
    
    const amount = Number.parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ amount, description, category, date }),
        });

        if (response.ok) {
            const newExpense = await response.json();
            allExpenses.unshift(newExpense); // Add to beginning of array
            renderExpenses();
            updateWeeklyStats();
            document.getElementById('expense-form').reset();
            document.getElementById('date').valueAsDate = new Date();
            showMessage('Expense added successfully!', 'success');
        } else if (response.status === 401) {
            showMessage('Session expired. Please login again.', 'error');
            handleLogout();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Failed to add expense', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please check if the server is running.', 'error');
    }
}

// Load all expenses from the server
async function loadExpenses() {
    if (!authToken) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (response.ok) {
            allExpenses = await response.json();
            renderExpenses();
            updateWeeklyStats();
        } else if (response.status === 401) {
            showMessage('Session expired. Please login again.', 'error');
            handleLogout();
        } else {
            showMessage('Failed to load expenses', 'error');
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
        showMessage('Could not connect to server', 'error');
    }
}

// Render expenses based on filter
function renderExpenses() {
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = ''; // Clear existing list
    
    const filteredExpenses = showWeekOnly 
        ? allExpenses.filter(expense => isExpenseInCurrentWeek(expense))
        : allExpenses;
    
    if (filteredExpenses.length === 0) {
        const message = showWeekOnly 
            ? 'No expenses this week. Add your first expense above!'
            : 'No expenses yet. Add your first expense above!';
        expensesList.innerHTML = `<li class="no-expenses">${message}</li>`;
    } else {
        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const expense of filteredExpenses) {
            addExpenseToList(expense);
        }
        updateTotal(filteredExpenses);
    }
}

// Add a single expense to the list
function addExpenseToList(expense) {
    const expensesList = document.getElementById('expenses-list');
    
    // Remove "no expenses" message if it exists
    const noExpensesMsg = expensesList.querySelector('.no-expenses');
    if (noExpensesMsg) {
        noExpensesMsg.remove();
    }
    
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.dataset.id = expense.id || expense._id; // Handle both SQL and MongoDB IDs
    
    li.innerHTML = `
        <div class="expense-details">
            <span class="expense-description">${escapeHtml(expense.description)}</span>
            <span class="expense-date">${formatDate(expense.date)}</span>
        </div>
        <div class="expense-actions">
            <span class="expense-amount">$${Number.parseFloat(expense.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteExpense('${expense.id || expense._id}')">Delete</button>
        </div>
    `;
    
    expensesList.appendChild(li);
}

// Delete an expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    if (!authToken) {
        showMessage('Please login to delete expenses', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            // Remove from allExpenses array
            allExpenses = allExpenses.filter(exp => (exp.id || exp._id) !== id);
            renderExpenses();
            updateWeeklyStats();
            showMessage('Expense deleted successfully!', 'success');
        } else if (response.status === 401) {
            showMessage('Session expired. Please login again.', 'error');
            handleLogout();
        } else {
            showMessage('Failed to delete expense', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Could not delete expense.', 'error');
    }
}

// Calculate and update total amount
function updateTotal(expenses = null) {
    if (!expenses) {
        expenses = showWeekOnly 
            ? allExpenses.filter(expense => isExpenseInCurrentWeek(expense))
            : allExpenses;
    }
    
    const total = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0);
    const displayText = showWeekOnly ? 'This Week: $' : 'Total: $';
    document.getElementById('total-amount').textContent = `${displayText}${total.toFixed(2)}`;
}

// Show success/error messages
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== WEEKLY TRACKING FUNCTIONS ==========

// Set up weekly navigation event listeners
function setupWeeklyListeners() {
    document.getElementById('prev-week')?.addEventListener('click', () => {
        navigateWeek(-1);
    });
    
    document.getElementById('next-week')?.addEventListener('click', () => {
        navigateWeek(1);
    });
    
    document.getElementById('current-week-btn')?.addEventListener('click', () => {
        setCurrentWeek();
        renderExpenses();
        updateWeeklyStats();
    });
    
    document.getElementById('show-week-only')?.addEventListener('change', (e) => {
        showWeekOnly = e.target.checked;
        renderExpenses();
    });
}

// Set current week (Sunday to Saturday)
function setCurrentWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get Sunday of current week
    currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - dayOfWeek);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Get Saturday of current week
    currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    updateWeekDisplay();
}

// Navigate to previous or next week
function navigateWeek(direction) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
    currentWeekEnd.setDate(currentWeekEnd.getDate() + (direction * 7));
    
    updateWeekDisplay();
    renderExpenses();
    updateWeeklyStats();
}

// Update week display text
function updateWeekDisplay() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = currentWeekEnd.toLocaleDateString('en-US', options);
    
    document.getElementById('current-week-range').textContent = `${startStr} - ${endStr}`;
}

// Check if expense is in current week
function isExpenseInCurrentWeek(expense) {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentWeekStart && expenseDate <= currentWeekEnd;
}

// Update weekly statistics
function updateWeeklyStats() {
    const weekExpenses = allExpenses.filter(expense => isExpenseInCurrentWeek(expense));
    
    // Total amount
    const total = weekExpenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0);
    document.getElementById('week-total').textContent = `$${total.toFixed(2)}`;
    
    // Number of expenses
    document.getElementById('week-count').textContent = weekExpenses.length;
    
    // Daily average (over 7 days)
    const average = total / 7;
    document.getElementById('week-average').textContent = `$${average.toFixed(2)}`;
    
    // Top category
    const categoryTotals = {};
    for (const expense of weekExpenses) {
        const cat = expense.category || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number.parseFloat(expense.amount);
    }
    
    let topCategory = '-';
    let maxAmount = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > maxAmount) {
            maxAmount = amount;
            topCategory = formatCategoryName(category);
        }
    }
    
    document.getElementById('week-category').textContent = topCategory;
}

// Format category name for display
function formatCategoryName(category) {
    if (!category) return 'Other';
    return category.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}
