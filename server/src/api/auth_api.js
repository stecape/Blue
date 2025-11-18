import express from 'express'
import passport from 'passport'
import { configurePassport, setDbPool } from './auth_api/passport_config.js'

const router = express.Router()

// Middleware per verificare se l'utente è autenticato
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ authenticated: false, message: 'Not authenticated' })
}

// Middleware per verificare se l'utente è admin
export const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false, message: 'Not authenticated' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }
  next()
}

// Route per iniziare il processo di autenticazione con Google
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
)

// Route di callback dopo l'autenticazione Google
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/unauthorized` 
  }),
  (req, res) => {
    // Autenticazione riuscita, reindirizza alla home
    res.redirect(`${process.env.CLIENT_URL}/`)
  }
)

// Route per il logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' })
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed' })
      }
      res.clearCookie('connect.sid')
      res.json({ message: 'Logged out successfully' })
    })
  })
})

// Route per verificare lo stato di autenticazione
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    })
  } else {
    res.json({
      authenticated: false
    })
  }
})

// Funzione per inizializzare le API di autenticazione
const auth_api = (app, pool) => {
  // Configura Passport prima di usare le routes
  setDbPool(pool)
  configurePassport()
  app.use(passport.initialize())
  app.use(passport.session())
  
  // Registra le routes
  app.use('/auth', router)
}

export default auth_api