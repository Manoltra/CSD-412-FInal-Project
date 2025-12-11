# Expense Tracker Backend

A Node.js/Express backend server for the Expense Tracker Web Application with JWT authentication and RESTful API endpoints.

## Features

✅ User Registration & Login with JWT tokens  
✅ Password hashing with bcryptjs  
✅ CRUD operations for expenses  
✅ User-specific expense filtering  
✅ Input validation and error handling  
✅ CORS enabled for frontend communication  
✅ Security headers middleware  

## Project Structure

```
backend/
├── routes/
│   ├── auth.js           # Authentication endpoints (/api/auth)
│   └── expenses.js       # Expense management endpoints (/api/expenses)
├── server.js             # Main Express server
├── package.json          # Dependencies
├── .env                  # Environment variables
└── README.md             # This file
```

## Setup

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CORS_ORIGIN=*
```

**Important:** Change `JWT_SECRET` to a strong random string in production.

### 3. Start the Server

```powershell
# Development mode (with hot reload)
npm run dev

# Or production mode
npm start
```

Output:
```
✅ Server running on http://localhost:5000
📝 Environment: development
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1701234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1701234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### GET `/api/auth/verify`
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "1701234567890",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Expense Routes (`/api/expenses`)

#### GET `/api/expenses`
Get all expenses for the logged-in user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
[
  {
    "id": "1701234567891",
    "userId": "1701234567890",
    "amount": 45.50,
    "description": "Grocery shopping",
    "category": "food",
    "date": "2025-12-09",
    "createdAt": "2025-12-09T12:34:56.789Z"
  }
]
```

---

#### POST `/api/expenses`
Create a new expense.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "amount": 45.50,
  "description": "Grocery shopping",
  "category": "food",
  "date": "2025-12-09"
}
```

**Response (201):**
```json
{
  "id": "1701234567891",
  "userId": "1701234567890",
  "amount": 45.50,
  "description": "Grocery shopping",
  "category": "food",
  "date": "2025-12-09",
  "createdAt": "2025-12-09T12:34:56.789Z"
}
```

---

#### GET `/api/expenses/:id`
Get a specific expense.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "id": "1701234567891",
  "userId": "1701234567890",
  "amount": 45.50,
  "description": "Grocery shopping",
  "category": "food",
  "date": "2025-12-09",
  "createdAt": "2025-12-09T12:34:56.789Z"
}
```

---

#### PUT `/api/expenses/:id`
Update an expense.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "amount": 50.00,
  "description": "Updated grocery shopping"
}
```

**Response (200):**
```json
{
  "id": "1701234567891",
  "userId": "1701234567890",
  "amount": 50.00,
  "description": "Updated grocery shopping",
  "category": "food",
  "date": "2025-12-09",
  "updatedAt": "2025-12-09T13:00:00.000Z"
}
```

---

#### DELETE `/api/expenses/:id`
Delete an expense.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "message": "Expense deleted successfully",
  "expense": {
    "id": "1701234567891",
    "userId": "1701234567890",
    "amount": 45.50,
    "description": "Grocery shopping",
    "category": "food",
    "date": "2025-12-09"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "message": "Expense not found"
}
```

### 409 Conflict
```json
{
  "message": "Email already registered"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

## Testing with cURL or Postman

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### 2. Add Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"amount":45.50,"description":"Groceries","category":"food","date":"2025-12-09"}'
```

### 3. Get All Expenses
```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Setup (Future)

Currently, the backend uses **in-memory storage** (data resets when server restarts). 

To upgrade to a persistent database:

### MySQL Example

```bash
npm install mysql2
```

Then update `routes/auth.js` and `routes/expenses.js` to use database queries instead of in-memory arrays.

### MongoDB Example

```bash
npm install mongoose
```

## Security Notes

⚠️ **Development Only:**
- JWT_SECRET is a placeholder - change in production
- Passwords are hashed with bcryptjs
- No rate limiting (add in production)
- CORS is open to all origins (restrict in production)

## Production Deployment

1. **Set strong JWT_SECRET:**
   ```bash
   JWT_SECRET=generate-a-long-random-string-here
   ```

2. **Use a database:**
   - Replace in-memory storage with MySQL/PostgreSQL/MongoDB

3. **Add rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

4. **Enable HTTPS:**
   - See `/docs/HTTPS_SERVER_SETUP.md`

5. **Use Docker:**
   ```bash
   docker-compose up
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in .env or kill process on port 5000 |
| "Cannot find module" | Run `npm install` |
| CORS errors | Check CORS_ORIGIN in .env |
| Invalid token errors | Ensure token is prefixed with "Bearer " in Authorization header |

## Next Steps

- Add database integration (MySQL/MongoDB)
- Implement refresh token logic
- Add rate limiting and security middleware
- Set up environment-specific configurations
- Write comprehensive test suite

---

**Backend Ready! Connect your frontend to http://localhost:5000**
