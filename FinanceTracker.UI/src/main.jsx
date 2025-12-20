import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import axios from 'axios'

// ================= Axios Global Configuration =================
axios.interceptors.request.use(config => {
  // 1. Check if we have a token in the "pocket" (localStorage)
  const token = localStorage.getItem('token')
  
  // 2. If found, attach it to the Authorization header
  // Format: "Bearer <token>"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, error => {
  return Promise.reject(error)
})
// ==============================================================

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)