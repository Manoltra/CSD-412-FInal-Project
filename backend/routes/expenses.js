const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock database - in-memory expense storage
// In production, replace with actual database
const expenses = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// GET /api/expenses - Get all expenses for logged-in user
router.get('/', verifyToken, (req, res) => {
    try {
        // Filter expenses by user
        const userExpenses = expenses.filter(e => e.userId === req.userId);
        
        // Sort by date (newest first)
        userExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(userExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});

// POST /api/expenses - Create new expense
router.post('/', verifyToken, (req, res) => {
    try {
        const { amount, description, category, date } = req.body;

        // Validation
        if (!amount || !description || !category || !date) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const parsedAmount = Number.parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        // Validate date format
        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Create expense
        const newExpense = {
            id: Date.now().toString(),
            userId: req.userId,
            userEmail: req.userEmail,
            amount: parsedAmount,
            description: description.trim(),
            category: category.trim(),
            date: date,
            createdAt: new Date()
        };

        expenses.push(newExpense);

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Error creating expense' });
    }
});

// GET /api/expenses/:id - Get single expense
router.get('/:id', verifyToken, (req, res) => {
    try {
        const expense = expenses.find(e => e.id === req.params.id && e.userId === req.userId);
        
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Error fetching expense' });
    }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', verifyToken, (req, res) => {
    try {
        const { amount, description, category, date } = req.body;
        
        const expenseIndex = expenses.findIndex(e => e.id === req.params.id && e.userId === req.userId);
        
        if (expenseIndex === -1) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Validation
        if (amount !== undefined) {
            const parsedAmount = Number.parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({ message: 'Amount must be a positive number' });
            }
            expenses[expenseIndex].amount = parsedAmount;
        }

        if (description !== undefined) {
            expenses[expenseIndex].description = description.trim();
        }

        if (category !== undefined) {
            expenses[expenseIndex].category = category.trim();
        }

        if (date !== undefined) {
            if (isNaN(Date.parse(date))) {
                return res.status(400).json({ message: 'Invalid date format' });
            }
            expenses[expenseIndex].date = date;
        }

        expenses[expenseIndex].updatedAt = new Date();

        res.json(expenses[expenseIndex]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Error updating expense' });
    }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', verifyToken, (req, res) => {
    try {
        const expenseIndex = expenses.findIndex(e => e.id === req.params.id && e.userId === req.userId);
        
        if (expenseIndex === -1) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const deletedExpense = expenses.splice(expenseIndex, 1);

        res.json({
            message: 'Expense deleted successfully',
            expense: deletedExpense[0]
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense' });
    }
});

module.exports = router;
