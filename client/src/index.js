import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MessageQueue } from "@react-md/alert"
import { AuthProvider } from "./Auth/AuthContext"
import AuthenticatedApp from "./Auth/AuthenticatedApp"
import './AdminApp/styles/index.scss'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <MessageQueue id="notify" duplicates="allow">
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </MessageQueue>
  </StrictMode>,
)