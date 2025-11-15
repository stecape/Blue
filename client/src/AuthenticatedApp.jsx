import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Configuration } from "@react-md/layout"
import { SocketContext, socket } from './Helpers/socket'
import { CtxProvider } from "./Helpers/CtxProvider"
import { useAuth } from "./Helpers/AuthContext"
import Login from "./sections/Login/Login"
import Unauthorized from "./sections/Unauthorized/Unauthorized"
import Layout from "./Layout"
import UserApp from "./UserApp/UserApp"

const AuthenticatedApp = () => {
  const { authenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        backgroundColor: '#ffffffff'
      }}>
        Verifica autenticazione...
      </div>
    )
  }

  // Se non autenticato, mostra solo login e unauthorized
  if (!authenticated) {
    return (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Configuration>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Configuration>
      </BrowserRouter>
    )
  }

  // Se autenticato, controlla il ruolo
  if (user?.role === 'admin') {
    // Admin: app completa con SocketContext e CtxProvider
    return (
      <SocketContext.Provider value={socket}>
        <CtxProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Configuration>
              <Layout />
            </Configuration>
          </BrowserRouter>
        </CtxProvider>
      </SocketContext.Provider>
    )
  } else {
    // User: app semplificata senza CtxProvider
    return <UserApp />
  }
}

export default AuthenticatedApp
