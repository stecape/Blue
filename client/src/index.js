import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MessageQueue } from "@react-md/alert"
import { AuthProvider } from "./Helpers/AuthContext"
import AuthenticatedApp from "./AuthenticatedApp"
import './styles/index.scss'

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