import { Navigate } from 'react-router-dom'
import { useAuth } from './Helpers/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
