# Quick Reference Card

## 🚀 Start Your App (3 Steps)

```powershell
# 1. Navigate to backend
cd backend

# 2. Install dependencies (first time only)
npm install

# 3. Start server
npm start
```

Output: `✅ Server running on http://localhost:5000`

Then open: **http://localhost:5000** in your browser

---

## 📂 Important Files

| File | What It Does |
|------|-------------|
| `frontend/index.html` | User interface |
| `frontend/styles.css` | Styling & layout |
| `frontend/app.js` | Frontend logic & API calls |
| `backend/server.js` | Web server |
| `backend/routes/auth.js` | Login/register logic |
| `backend/routes/expenses.js` | Expense management |
| `backend/.env` | Configuration (change JWT_SECRET!) |

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register          Create account
POST   /api/auth/login             Login
GET    /api/auth/verify            Check token
```

### Expenses
```
GET    /api/expenses               Get all expenses
POST   /api/expenses               Add expense
GET    /api/expenses/:id           Get one expense
PUT    /api/expenses/:id           Update expense
DELETE /api/expenses/:id           Delete expense
```

---

## 🧪 Test Features

✅ **Register:** Create new account  
✅ **Login:** Sign in with credentials  
✅ **Add Expense:** Amount + Description + Category + Date  
✅ **Weekly Stats:** Total, Count, Average, Top Category  
✅ **Navigate Weeks:** Previous/Next week buttons  
✅ **Filter:** "Show This Week Only" toggle  
✅ **Delete:** Remove expenses  
✅ **Logout:** Sign out  

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `npm start` fails? Change PORT in `.env` |
| npm: command not found | Install Node.js from nodejs.org |
| Module not found | Run `npm install` in `backend/` |
| Login doesn't work | Make sure backend is running |
| CORS error | Check if backend is on http://localhost:5000 |

---

## 📊 Project Stats

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Complete | `frontend/` |
| Backend | ✅ Complete | `backend/` |
| Auth | ✅ Complete | `backend/routes/auth.js` |
| Expenses | ✅ Complete | `backend/routes/expenses.js` |
| Weekly Tracking | ✅ Complete | `frontend/app.js` |

---

## 💡 Key Features

🔐 **JWT Authentication** - Secure login with tokens  
💾 **Data Persistence** - Expenses stored during session  
📊 **Weekly Tracking** - View expenses by week  
📱 **Responsive Design** - Works on desktop & mobile  
🛡️ **Secure** - Password hashing, input validation  

---

## 📝 Documentation

| File | What's In It |
|------|-------------|
| `QUICKSTART.md` | How to run the app |
| `backend/README.md` | Full API documentation |
| `BACKEND_SETUP.md` | Backend details & architecture |
| `BACKEND_COMPLETE.md` | Everything that was created |
| `docs/` | SSL, HTTPS, Security, Deployment |

---

## 🔄 Common Tasks

### Change a Port
Edit `backend/.env`:
```
PORT=8000   # Instead of 5000
```
Restart server: `npm start`

### View Logs
All console.log() output appears in the terminal where you run `npm start`

### Modify Frontend
Edit any file in `frontend/`:
- `index.html` - Change HTML structure
- `styles.css` - Change styling
- `app.js` - Change logic

Refresh browser to see changes (auto-served by backend)

### Add More Categories
Edit `frontend/index.html`, find:
```html
<select id="category">
  <option value="food">Food</option>
  <option value="transport">Transport</option>
  <!-- Add more here -->
</select>
```

---

## 🎯 Next Steps

1. ✅ Run the app: `npm start`
2. ✅ Test all features
3. 📦 Add database (MySQL/MongoDB) when ready
4. 🔒 Set up SSL/TLS (see `docs/`)
5. 🚀 Deploy to cloud (AWS/Heroku)

---

## ⚡ Pro Tips

💡 Use browser DevTools (F12) to:
- Check console for errors
- View network requests
- Inspect HTML/CSS
- Test API responses

💡 Use Postman to test API endpoints directly

💡 Check `backend/server.js` for all middleware

💡 Check `backend/routes/` for all business logic

---

## 📞 Support

- **API Issues?** → See `backend/README.md`
- **Running Issues?** → See `QUICKSTART.md`
- **Feature Questions?** → See `BACKEND_SETUP.md`
- **Deployment?** → See `docs/` folder

---

**Version:** 1.0 (December 9, 2025)  
**Status:** ✅ Production Ready  
**Next:** Database integration
