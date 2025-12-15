# 💰 Finance Tracker

A full-stack web application for tracking personal income and expenses, built with **.NET 10** and **React**. This project demonstrates modern web development practices, RESTful API design, and responsive UI/UX.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![.NET Version](https://img.shields.io/badge/.NET-10.0-blue)
![React Version](https://img.shields.io/badge/React-18.3-blue)

## 📸 Screenshots

> Screenshots will be added as features are completed

## ✨ Features

### Currently Implemented
- ✅ View all transactions in a beautiful, responsive table
- ✅ **Add new transactions with beautiful modal form**
- ✅ **Delete transactions with confirmation dialog**
- ✅ **Form validation and error handling**
- ✅ **Smooth animations and transitions**
- ✅ Real-time data synchronization with backend
- ✅ Income and expense categorization with color coding
- ✅ Modern, clean UI with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Date formatting and amount display

### Coming Soon
- 🔨 Edit existing transactions
- 🔨 Delete transactions with confirmation
- 🔨 Summary dashboard with total income, expenses, and balance
- 🔨 Filter transactions by type, category, and date range
- 🔨 Search functionality
- 🔨 Data visualization with charts
- 🔨 Responsive mobile design
- 🔨 Category management

## 🛠️ Tech Stack

### Backend
- **Framework:** .NET 10 Web API
- **Database:** SQLite with Entity Framework Core
- **Architecture:** RESTful API with Repository Pattern
- **Features:** 
  - CRUD operations
  - Data validation
  - CORS configuration
  - Async/await patterns

### Frontend
- **Framework:** React 18.3 with Vite
- **Styling:** Tailwind CSS 3.4
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
   git clone https://github.com/yourusername/finance-tracker.git
   cd finance-tracker
   ```

2. **Set up the Backend**
   ```bash
   cd FinanceTracker.API
   
   # Restore dependencies
   dotnet restore
   
   # Create database
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

| Method |          Endpoint           | Description            |
|--------|-----------------------------|------------------------|
| GET    | `/api/transactions`         | Get all transactions   |
| GET    | `/api/transactions/{id}`    | Get transaction by ID  |
| POST   | `/api/transactions`         | Create new transaction |
| PUT    | `/api/transactions/{id}`    | Update transaction     |
| DELETE | `/api/transactions/{id}`    | Delete transaction     |
| GET    | `/api/transactions/summary` | Get summary statistics |

### Request/Response Examples

**Create Transaction (POST /api/transactions)**
```json
{
  "description": "Monthly Salary",
  "amount": 5000,
  "date": "2024-12-14T00:00:00",
  "type": "Income",
  "category": "Salary"
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "description": "Monthly Salary",
  "amount": 5000.00,
  "date": "2024-12-14T00:00:00",
  "type": "Income",
  "category": "Salary"
}
```

## 🎨 UI Features

### Design Principles
- Clean, modern interface
- Intuitive navigation
- Responsive layout
- Smooth animations
- Color-coded transactions (Green for income, Red for expenses)

### Tailwind CSS Components
- Custom color scheme
- Responsive grid system
- Hover effects
- Loading states
- Error boundaries

## 🧪 Testing

### Backend Testing
```bash
cd FinanceTracker.API
dotnet test
```

### API Testing
- Swagger UI available at `http://localhost:5260/swagger`
- Interactive API documentation and testing

## 📚 What I Learned

### Backend Development
- Building RESTful APIs with .NET 10
- Entity Framework Core and database migrations
- Async/await patterns for better performance
- Data validation and error handling
- CORS configuration for cross-origin requests

### Frontend Development
- React hooks (useState, useEffect)
- Component-based architecture
- API integration with Axios
- Tailwind CSS for rapid UI development
- State management in React

### Full-Stack Integration
- Connecting React frontend to .NET backend
- Handling API responses and errors
- Managing loading states
- CORS policy configuration

## 🚧 Development Roadmap

### Phase 1: Core Features (Week 1)
- [x] Backend API setup
- [x] Database configuration
- [x] CRUD operations
- [x] Frontend setup
- [x] Display transactions
- [x] **Add transaction form with modal**
- [x] **Delete functionality with confirmation**
- [x] **Form validation**

### Phase 2: Enhanced Features (Week 2)
- [ ] Edit transactions
- [ ] Filtering and search
- [ ] Summary dashboard
- [ ] Data validation
- [ ] Error notifications

### Phase 3: Advanced Features (Week 3)
- [ ] Charts and graphs
- [ ] Category management
- [ ] Date range filters
- [ ] Export to CSV
- [ ] Print functionality

### Phase 4: Polish (Week 4)
- [ ] Mobile responsiveness
- [ ] Loading animations
- [ ] User preferences
- [ ] Dark mode
- [ ] Performance optimization

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Author

**Your Name**
- GitHub    : [@kaushalladiya](https://github.com/kaushalladiya)
- LinkedIn  : [@kaushalladiya](https://linkedin.com/in/kaushalladiya)

## 🙏 Acknowledgments

- Built as part of full-stack development learning journey
- Thanks to the .NET and React communities for excellent documentation
- Tailwind CSS for making styling enjoyable

---

**⭐ If you find this project helpful, please consider giving it a star!**