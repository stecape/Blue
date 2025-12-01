import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Configuration } from '@react-md/layout';
import { useAuth } from './AuthContext';
import Login from './Login/Login';
import Unauthorized from './Unauthorized/Unauthorized';
import UserApp from '../UserApp/UserApp';
import AdminApp from '../AdminApp/AdminApp';

const AuthenticatedApp = () => {
  const { authenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          backgroundColor: '#ffffffff',
        }}
      >
        Verifica autenticazione...
      </div>
    );
  }

  // Se non autenticato, mostra solo login e unauthorized
  if (!authenticated) {
    return (
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Configuration>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Configuration>
      </BrowserRouter>
    );
  }

  // Se autenticato, controlla il ruolo
  if (user?.role === 'admin') {
    // Admin: app completa con SocketContext e CtxProvider
    return <AdminApp />;
  } else {
    // User: app semplificata senza CtxProvider
    return <UserApp />;
  }
};

export default AuthenticatedApp;
