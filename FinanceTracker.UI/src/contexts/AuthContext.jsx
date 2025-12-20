import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

// 1. Create the Context (The "Cloud" container)
const AuthContext = createContext()

// 2. Custom Hook for easy access
// This lets any component say: "const { user, login } = useAuth()"
export const useAuth = () => {
  return useContext(AuthContext)
}

// 3. The Provider Component
// This wraps your entire app and "broadcasts" the login state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 4. Check for existing session on Page Load (Refresh)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Check if token is expired (exp is in seconds, Date.now is ms)
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          // Restore user from token
          // .NET Identity uses a specific URL for the Name claim, or 'unique_name'
          const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || decoded.sub
          setUser({ username, id: decoded.id })
        }
      } catch (error) {
        console.error("Invalid token:", error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  // 5. Login Function
  // Takes the token string from the backend, saves it, and updates state
  const login = (token) => {
    localStorage.setItem('token', token)
    const decoded = jwtDecode(token)
    const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || decoded.sub
    setUser({ username, id: decoded.id })
  }

  // 6. Logout Function
  // Clears the "Wristband" and kicks the user out
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // 7. Expose the values
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  }

  // Don't render the app until we've checked for an existing user
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}