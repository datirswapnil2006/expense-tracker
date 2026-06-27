# 💰 Personal Finance & Expense Tracker

A full-stack expense tracker built with the MERN stack (MongoDB, Express, React, Node.js). Log income and expenses, see your running balance, and visualize spending habits with interactive charts.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

🔗 **[Live Demo](https://your-app.vercel.app)** — replace with your actual Vercel URL

## ✨ Features

- 🔐 **Authentication** — secure signup/login with hashed passwords (bcrypt) and JWT sessions
- 📊 **Dashboard** — total income, total expenses, and current balance at a glance
- 📝 **Transaction ledger** — add, view, filter, and delete income/expense entries
- 🏷️ **Categorized spending** — groceries, rent, entertainment, transport, and more
- 📈 **Visualizations** — category breakdown (pie chart) and income vs. expense trend (bar chart), built with Recharts
- 🗄️ **MongoDB aggregation** — totals and chart data computed server-side, not in the browser

## 🛠️ Tech Stack

**Frontend:** React, Vite, Recharts, Lucide Icons
**Backend:** Node.js, Express, MongoDB, Mongoose
**Auth:** JWT, bcrypt



## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your own MONGODB_URI and JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:4000`.

### 3. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. Open the app

Visit `http://localhost:5173`, sign up for an account, and start logging transactions.

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── models/          # Mongoose schemas (User, Transaction)
│   ├── routes/          # Express routes (auth, transactions)
│   ├── middleware/       # JWT auth middleware
│   └── server.js
└── frontend/
    └── src/
        ├── components/   # React components
        ├── api.js        # API client (fetch wrapper)
        ├── App.jsx
        └── categories.js
```

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/signup` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/transactions` | List transactions | Yes |
| POST | `/api/transactions` | Create a transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |
| GET | `/api/transactions/summary` | Total income/expense/balance | Yes |
| GET | `/api/transactions/by-category` | Spending breakdown by category | Yes |
| GET | `/api/transactions/trend` | Income vs. expense over time | Yes |

## 🗺️ Roadmap

- [ ] Monthly budgets per category
- [ ] Recurring transactions
- [ ] CSV export
- [ ] Multi-currency support

## 📄 License

MIT — feel free to use this project as a learning reference or portfolio base.
