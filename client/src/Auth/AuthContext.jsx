import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

  // Verifica lo stato di autenticazione all'avvio
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`)
      
      if (response.data.authenticated) {
        setUser(response.data.user)
        setAuthenticated(true)
      } else {
        setUser(null)
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('Errore verifica autenticazione:', error)
      setUser(null)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    // Reindirizza alla route di autenticazione Google
    window.location.href = `${API_URL}/auth/google`
  }

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`)
      setUser(null)
      setAuthenticated(false)
      window.location.href = '/login'
    } catch (error) {
      console.error('Errore logout:', error)
    }
  }

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
