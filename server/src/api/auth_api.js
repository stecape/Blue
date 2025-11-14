import express from 'express'
import passport from 'passport'

const router = express.Router()

// Middleware per verificare se l'utente è autenticato
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ authenticated: false, message: 'Not authenticated' })
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
const auth_api = (app) => {
  app.use('/auth', router)
}

export default auth_api
