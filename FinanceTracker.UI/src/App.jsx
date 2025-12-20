import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './Dashboard'
import Reports from './Reports'
import Login from './Login'
import Register from './Register'

// Navigation Component (Only shown when logged in)
const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const { logout, user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path 
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" 
    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">FinanceTracker</span>
            </div>
            
            <div className="hidden md:flex space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/reports" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/reports')}`}>
                Reports & Analytics
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
               Hi, {user?.username}
            </span>

            {/* Logout Button */}
            <button
               onClick={logout}
               className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Logout
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// This checks: Do you have a wristband (isAuthenticated)?
// If NO -> Go to Login
// If YES -> Show the page
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 font-sans">
        {/* Only show Navbar if logged in */}
        {isAuthenticated && <Navbar />}
        
        <main className={isAuthenticated ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App