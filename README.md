# 💰 Finance Tracker

A full-stack web application for tracking personal income and expenses, built with **.NET 10** and **React**. This project demonstrates modern web development practices, RESTful API design, and responsive UI/UX.

![Project Status](https://img.shields.io/badge/status-active%20development-brightgreen)
![.NET Version](https://img.shields.io/badge/.NET-10.0-blue)
![React Version](https://img.shields.io/badge/React-18.3-blue)

## 📸 Screenshots

> Screenshots will be added as features are completed

## ✨ Features

### ✅ Implemented Features
- **Full-Stack Architecture**: React frontend communicating with .NET 10 Web API.
- **Advanced Reporting System**: Server-side aggregation for Monthly Trends and Comparisons using LINQ.
- **Interactive Dashboard**:
  - Gradient summary cards (Income, Expense, Balance).
  - Real-time statistics.
- **Data Visualization**:
  - **6-Month Trend Line Charts**: Visualizes financial history using Recharts.
  - **Expense Breakdown**: Interactive Pie Charts.
  - **Income vs Expense**: Comparative Bar Charts.
  - **Category Intelligence**: Ranks top spending and income sources with progress bars.
- **Client-Side Routing**: Seamless navigation between Dashboard and Reports.
- **Dark Mode Theme**: System-aware, persistent theme with local storage support.
- **Complete CRUD Operations**: Create, Read, Update, Delete transactions with modal forms.
- **Advanced Filtering**: Filter by Type, Category, and Date Range with real-time search.
- **User Feedback**: Toast notifications and loading skeletons.
- **Design System**: "Cascadia Mono" typography for financial precision.

### 🚧 In Progress
- **Authentication System**:
  - [x] Backend User Model & Database Setup
  - [x] Password Hashing (BCrypt) implementation
  - [ ] JWT Token Generation
  - [ ] React Login/Register Forms
  - [ ] Protected Routes

## 🎨 Design Philosophy

### Psychology of Money
This project utilizes specific design choices to build trust and clarity:
- **Visual Hierarchy**:
  - **Green & Bold**: Used for Income and Growth (Signals safety).
  - **Red & Bold**: Used for Expenses and Debts (Signals alert).
  - **Regular Weight**: Used for neutral information.
- **Typography**:
  - **Cascadia Mono**: Used exclusively across the app. The monospaced font implies "Calculation," "Accuracy," and "Terminal-like precision," similar to professional trading platforms.

## 🛠️ Tech Stack

### Backend
- **Framework:** .NET 10 Web API
- **Database:** SQLite with Entity Framework Core
- **Security:** BCrypt.Net for password hashing
- **Architecture:** RESTful API with Repository Pattern
- **Features:** - Async/await patterns
  - LINQ for server-side data aggregation
  - CORS configuration

### Frontend
- **Framework:** React 18.3 with Vite
- **Routing:** React Router DOM
- **Visualization:** Recharts
- **Styling:** Tailwind CSS 3.4
- **State Management:** React Context API & Hooks
- **HTTP Client:** Axios
- **State Management:** React Hooks (useState, useEffect)
- **Build Tool:** Vite 7.2

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kaushalladiya/finance-tracker.git
   cd finance-tracker
   ```

2. **Set up the Backend**
   ```bash
   cd FinanceTracker.API
   
   # Restore dependencies
   dotnet restore
   
   # Create database and apply migrations (Users & Transactions tables)
   dotnet ef database update
   
   # Run the API
   dotnet run
   ```
   Backend will run on `http://localhost:5260`

3. **Set up the Frontend**
   ```bash
   cd ../FinanceTracker.UI
   
   # Install dependencies
   npm install
   
   # Run the development server
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
FinanceTracker/
├── FinanceTracker.API/          # .NET Backend
│   ├── Controllers/             # API endpoints
│   │   └── TransactionsController.cs
│   ├── Data/                    # Database context
│   │   └── AppDbContext.cs
│   ├── Models/                  # Data models
│   │   └── Transaction.cs
│   ├── Migrations/              # EF Core migrations
│   ├── Program.cs               # App configuration
│   └── financetracker.db        # SQLite database
│
└── FinanceTracker.UI/           # React Frontend
    ├── src/
    │   ├── App.jsx              # Main component
    │   ├── config.js            # API configuration
    │   ├── index.css            # Global styles
    │   └── main.jsx             # App entry point
    ├── tailwind.config.js       # Tailwind configuration
    └── package.json             # Dependencies
```

## 🔌 API Endpoints

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions with filtering |
| GET | `/api/transactions/{id}` | Get transaction by ID |
| POST | `/api/transactions` | Create new transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/summary` | Get summary statistics |
| GET | `/api/transactions/reports/monthly` | Get 6-month trend data |
| GET | `/api/transactions/reports/comparison` | Compare current month vs previous/last year |
| GET | `/api/transactions/reports/top-categories` | Get top 5 income/expense sources |

## 🧪 Testing

### Backend Testing
```bash
cd FinanceTracker.API
dotnet test
```

### API Testing
- Swagger UI available at `http://localhost:5260/swagger`
- Interactive API documentation and testing

## 👨‍💻 Author

**Kaushal Ladiya**

* GitHub : [@kaushalladiya](https://github.com/kaushalladiya)
* LinkedIn : [@kaushalladiya](https://linkedin.com/in/kaushalladiya)

## 🙏 Acknowledgments

* Built as part of full-stack development learning journey
* Thanks to the .NET and React communities for excellent documentation
* Tailwind CSS for making styling enjoyable

---

**⭐ If you find this project helpful, please consider giving it a star!**