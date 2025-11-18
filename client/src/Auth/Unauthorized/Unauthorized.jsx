import { useNavigate } from 'react-router-dom'
import styles from './Unauthorized.module.scss'

const Unauthorized = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <div className={styles.content}>
          <h1>Accesso Non Autorizzato</h1>
          <p>
            Il tuo account Google non è autorizzato ad accedere a questa applicazione.
          </p>
          <p className={styles.subtitle}>
            Contatta l'amministratore per richiedere l'accesso.
          </p>
        </div>

        <button 
          className={styles.button}
          onClick={handleGoBack}
        >
          Torna al Login
        </button>
      </div>
    </div>
  )
}

export default Unauthorized
