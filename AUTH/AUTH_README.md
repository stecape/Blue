# 🔐 Autenticazione Google - Guida Rapida

## ✅ Implementazione Completata

L'autenticazione Google è stata integrata nel progetto usando **Passport.js** con strategia OAuth 2.0.

### 📁 File Creati/Modificati

**Server:**
- ✅ `server/src/auth/passport-config.js` - Configurazione Passport.js
- ✅ `server/src/api/auth_api.js` - API di autenticazione
- ✅ `server/index.js` - Integrazione session + passport
- ✅ `server/.env` - Variabili ambiente (da configurare)
- ✅ `server/.env.example` - Template configurazione

**Client:**
- ✅ `client/src/Helpers/AuthContext.jsx` - Context per gestire autenticazione
- ✅ `client/src/sections/Login/Login.jsx` - Pagina login con Google
- ✅ `client/src/sections/Login/Login.module.scss` - Stili landing page
- ✅ `client/src/sections/Unauthorized/Unauthorized.jsx` - Pagina accesso negato
- ✅ `client/src/sections/Unauthorized/Unauthorized.module.scss` - Stili unauthorized
- ✅ `client/src/ProtectedRoute.jsx` - Componente per proteggere routes
- ✅ `client/src/App.jsx` - Routing aggiornato con protezione
- ✅ `client/src/index.js` - Provider autenticazione integrato
- ✅ `client/src/Layout.jsx` - Pulsante logout + info utente
- ✅ `client/src/styles/Layout.scss` - Stili per user info e logout
- ✅ `client/.env` - Variabili ambiente
- ✅ `client/.env.example` - Template configurazione

**Documentazione:**
- ✅ `SETUP_AUTH.md` - Guida completa setup
- ✅ `.gitignore` - Aggiunto .env files

---

## 🚀 Setup Veloce (3 passaggi)

### 1️⃣ Configurare Google OAuth

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea progetto → API e servizi → Credenziali → OAuth 2.0
3. URI reindirizzamento: `http://localhost:3001/auth/google/callback`
4. Copia **Client ID** e **Client Secret**

### 2️⃣ Configurare file .env

**Genera SESSION_SECRET:**
```powershell
cd server
npm run generate-secret
```

**File: `server/.env`**
```env
GOOGLE_CLIENT_ID=tuo-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tuo-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
SESSION_SECRET=copia-il-secret-generato-dal-comando-sopra
CLIENT_URL=http://localhost:3000
AUTHORIZED_EMAILS=user1@gmail.com,user2@gmail.com
```

**File: `client/.env`** (già configurato)
```env
REACT_APP_API_URL=http://localhost:3001
```

### 3️⃣ Avviare l'app

```powershell
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client  
cd client
npm start
```

---

## 🎯 Come Funziona

### Flusso Utente

1. **Utente visita l'app** → Viene reindirizzato a `/login`
2. **Click "Accedi con Google"** → Popup Google OAuth
3. **Login con Google** → Verifica email autorizzata
   - ✅ **Email autorizzata** → Home page
   - ❌ **Email NON autorizzata** → `/unauthorized`
4. **Sessione attiva** → Accesso a tutte le pagine
5. **Click logout** → Torna a `/login`

### Routes

| Route | Protezione | Descrizione |
|-------|-----------|-------------|
| `/login` | 🟢 Pubblica | Landing page con Google Sign In |
| `/unauthorized` | 🟢 Pubblica | Fallback per utenti non autorizzati |
| `/` | 🔒 Protetta | Home e tutte le altre routes |
| `/types`, `/devices`, ecc. | 🔒 Protetta | Tutte protette da ProtectedRoute |

### API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/auth/google` | GET | Inizia OAuth flow |
| `/auth/google/callback` | GET | Callback dopo login Google |
| `/auth/status` | GET | Verifica se utente è autenticato |
| `/auth/logout` | GET | Logout + distrugge sessione |

---

## 🔧 Personalizzazione

### Aggiungere utenti autorizzati

Modifica `server/.env`:
```env
AUTHORIZED_EMAILS=nuovo@email.com,altro@email.com
```

### Usare l'autenticazione nei componenti

```jsx
import { useAuth } from './Helpers/AuthContext'

function MyComponent() {
  const { user, authenticated, logout } = useAuth()
  
  return (
    <div>
      {authenticated && (
        <>
          <p>Ciao, {user.name}!</p>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  )
}
```

### Proteggere nuove routes

```jsx
import ProtectedRoute from './ProtectedRoute'

<Route path="/nuova-pagina" element={
  <ProtectedRoute>
    <NuovaPagina />
  </ProtectedRoute>
} />
```

---

## 🔒 Sicurezza

✅ **Implementato:**
- Sessioni HTTP-only cookies
- Verifica email autorizzate server-side
- Protezione di tutte le routes esistenti
- Logout sicuro con distruzione sessione

⚠️ **Per Produzione:**
- Usa HTTPS (obbligatorio per OAuth)
- Genera SESSION_SECRET lungo e casuale
- Aggiungi URL produzione in Google Console
- Imposta `NODE_ENV=production`
- Non committare mai i file `.env`

---

## 📚 Documentazione Completa

Per maggiori dettagli, consulta `SETUP_AUTH.md`.

---

## ❓ FAQ

**Q: Come aggiungo un nuovo utente?**  
A: Aggiungi la sua email in `AUTHORIZED_EMAILS` nel file `server/.env`

**Q: Posso usare altri provider OAuth?**  
A: Sì, Passport.js supporta molti provider (Facebook, GitHub, ecc.)

**Q: L'autenticazione persiste dopo refresh?**  
A: Sì, le sessioni durano 24 ore (configurabile)

**Q: Devo riavviare il server dopo aver modificato .env?**  
A: Sì, sempre

---

## 🎉 Pronto!

L'autenticazione è completamente integrata. Configura le credenziali Google e sei pronto a partire!
