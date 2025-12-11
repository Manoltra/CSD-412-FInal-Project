# Quick Start Guide

Get your Expense Tracker application running in 3 easy steps!

## 📋 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Quick Start (5 minutes)

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

Wait for installation to complete. You'll see `added X packages` when done.

### Step 2: Start the Backend Server

```powershell
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
📝 Environment: development
```

Keep this terminal window open! The server is now running.

### Step 3: Open the App in Your Browser

Open a new terminal/PowerShell and navigate to the project:

```powershell
# Open the app
Start-Process "http://localhost:5000"
```

Or simply open your browser and go to: **http://localhost:5000**

---

## ✅ Test the Application

### 1. Create an Account
- Click "Don't have an account? Register here"
- Fill in:
  - Name: `John Doe`
  - Email: `john@example.com`
  - Password: `password123`
- Click "Register"

### 2. You're Logged In!
Welcome screen shows: "Welcome, John Doe!"

### 3. Add Expenses
- Enter amount: `45.50`
- Description: `Grocery shopping`
- Category: `food`
- Date: `2025-12-09`
- Click "Add Expense"

### 4. Test Weekly Tracking
- View this week's expenses
- Click "Previous Week" / "Next Week" to navigate
- Check the 4 stats: Total, Count, Average, Top Category
- Toggle "Show This Week Only" checkbox

### 5. Delete an Expense
- Click "Delete" button on any expense
- Confirm deletion

### 6. Logout
- Click "Logout" button in top right
- You're back at the login screen

---

## 🔧 Development Commands

### Backend

```powershell
cd backend

# Run with auto-reload (requires nodemon to be installed)
npm run dev

# Run once
npm start
```

### Frontend

The frontend is served automatically when backend starts. No separate build needed!

- **Frontend files:** `frontend/index.html`, `frontend/styles.css`, `frontend/app.js`
- **Automatically served at:** `http://localhost:5000`

---

## 📁 Project Structure

```
CSD-412-FInal-Project/
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   └── app.js              # JavaScript logic
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env                # Configuration
│   ├── routes/
│   │   ├── auth.js         # Login/Register
│   │   └── expenses.js     # Expense CRUD
│   └── README.md           # Backend docs
├── docs/                   # Documentation
├── certs/                  # SSL certificates (empty for dev)
└── docker-compose.yml      # Docker setup
```

---

## 🐛 Troubleshooting

### "Port 5000 already in use"
Another application is using port 5000. Either:
1. Kill the process on port 5000
2. Change PORT in `backend/.env`

**PowerShell:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot find module" or "npm install fails"
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Frontend shows but buttons don't work
- Make sure backend is running (`npm start`)
- Check console (F12) for errors
- Refresh the page

### Login/Register not working
- Check that backend is on `http://localhost:5000`
- Check browser console for error messages
- Verify `.env` has `PORT=5000`

---

## 🔐 Authentication Flow

1. **Register** → Creates user with hashed password → Returns JWT token
2. **Login** → Verifies credentials → Returns JWT token
3. **Token stored** → localStorage saves token and user info
4. **API requests** → Token sent with every request
5. **Logout** → Clears token and returns to login

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/verify` - Check token validity

### Expenses
- `GET /api/expenses` - Get all your expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

---

## 🌐 Access Points

- **Frontend UI:** http://localhost:5000
- **API Base URL:** http://localhost:5000/api
- **API Auth:** http://localhost:5000/api/auth
- **API Expenses:** http://localhost:5000/api/expenses

---

## 📝 Features Checklist

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Add/Edit/Delete Expenses
- ✅ Weekly Expense Tracking
- ✅ Category Filtering
- ✅ Weekly Statistics (Total, Count, Average, Top Category)
- ✅ Responsive Design
- ✅ Session Persistence (localStorage)

---

## 🎯 Next Steps

1. **Customize:**
   - Change JWT_SECRET in `backend/.env`
   - Add more expense categories
   - Customize CSS styling

2. **Database Integration:**
   - Replace in-memory storage with MySQL/MongoDB
   - See `backend/README.md` for details

3. **Production Deploy:**
   - Set up SSL/TLS (see `docs/HTTPS_SERVER_SETUP.md`)
   - Deploy to AWS/Heroku/DigitalOcean
   - Use Docker (see `docker-compose.yml`)

4. **Add Features:**
   - Reports and analytics
   - Budget alerts
   - Multi-user sharing
   - Export to CSV/PDF

---

## 📞 Need Help?

1. Check `backend/README.md` for API details
2. Check `frontend/app.js` for frontend logic
3. Look in `docs/` folder for deployment guides
4. Check browser console (F12) for error messages

---

**Ready to go! 🎉**

```powershell
cd backend && npm start
```

Then visit: http://localhost:5000
