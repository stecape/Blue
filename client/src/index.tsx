import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageQueue } from '@react-md/alert';
import { AuthProvider } from './Auth/AuthContext';
import AuthenticatedApp from './Auth/AuthenticatedApp';
import axios from 'axios';
import './AdminApp/styles/index.scss';

// Configurazione globale di axios per inviare i cookie in tutte le richieste
axios.defaults.withCredentials = true;

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <MessageQueue id="notify" duplicates="allow">
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </MessageQueue>
  </StrictMode>,
);
