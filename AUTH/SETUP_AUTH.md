# Configurazione Google OAuth per AMARILLO

## Setup Iniziale

### 1. Creare progetto Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Vai su "API e servizi" > "Credenziali"
4. Clicca "Crea credenziali" > "ID client OAuth 2.0"
5. Configura la schermata per il consenso OAuth se richiesto
6. Tipo applicazione: "Applicazione web"
7. Aggiungi URI di reindirizzamento autorizzati:
   - `http://localhost:3001/auth/google/callback`
   - (in produzione aggiungi l'URL del tuo server)
8. Copia il Client ID e il Client Secret

### 2. Configurare il Server

Crea il file `server/.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
SESSION_SECRET=genera-una-stringa-casuale-lunga-e-sicura
CLIENT_URL=http://localhost:3000
AUTHORIZED_EMAILS=email1@example.com,email2@example.com
```

**Importante**: Aggiungi le email autorizzate in `AUTHORIZED_EMAILS` separate da virgola.

### 3. Configurare il Client

Crea il file `client/.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

### 4. Installare dipendenze

Le dipendenze necessarie sono già presenti in package.json:
- Server: `passport`, `passport-google-oauth20`, `express-session`
- Client: `@react-oauth/google`, `axios`

### 5. Avviare l'applicazione

```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm start
```

## Come Funziona

### Flusso di Autenticazione

1. **Utente non autenticato**: Viene reindirizzato automaticamente a `/login`
2. **Click su "Accedi con Google"**: Viene reindirizzato a Google OAuth
3. **Login Google**: L'utente si autentica con Google
4. **Verifica autorizzazione**: Il server controlla se l'email è in `AUTHORIZED_EMAILS`
   - ✅ **Autorizzato**: Reindirizzato alla home
   - ❌ **Non autorizzato**: Reindirizzato a `/unauthorized`
5. **Sessione attiva**: L'utente può navigare tutte le pagine protette

### Routes

- `/login` - Pagina di login (pubblica)
- `/unauthorized` - Pagina per utenti non autorizzati (pubblica)
- `/` e tutte le altre routes - Protette, richiedono autenticazione

### API Endpoints

- `GET /auth/google` - Inizia il processo di autenticazione Google
- `GET /auth/google/callback` - Callback OAuth dopo login Google
- `GET /auth/status` - Verifica stato autenticazione
- `GET /auth/logout` - Logout dell'utente

## Aggiunta di Pulsante Logout

Per aggiungere un pulsante di logout in qualsiasi componente:

```jsx
import { useAuth } from './Helpers/AuthContext'

function MyComponent() {
  const { user, logout } = useAuth()
  
  return (
    <div>
      <p>Ciao, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Produzione

Per la produzione:

1. Modifica `GOOGLE_CALLBACK_URL` con l'URL del tuo server
2. Modifica `CLIENT_URL` con l'URL del tuo client
3. Imposta `NODE_ENV=production`
4. Assicurati di usare HTTPS (richiesto da Google OAuth)
5. Aggiungi l'URL di produzione ai redirect URI in Google Console

## Sicurezza

- ✅ Le sessioni sono HTTP-only cookies
- ✅ Solo email autorizzate possono accedere
- ✅ Tutte le routes sono protette con `ProtectedRoute`
- ✅ Il SESSION_SECRET deve essere lungo e casuale
- ⚠️ Non committare mai i file `.env` nel repository
