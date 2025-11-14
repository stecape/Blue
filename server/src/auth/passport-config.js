import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'

dotenv.config()

// Lista degli utenti autorizzati (email)
const authorizedEmails = process.env.AUTHORIZED_EMAILS 
  ? process.env.AUTHORIZED_EMAILS.split(',').map(email => email.trim())
  : []

export const configurePassport = () => {
  // Strategia Google OAuth 2.0
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      (accessToken, refreshToken, profile, done) => {
        // Verifica se l'email dell'utente è autorizzata
        const email = profile.emails?.[0]?.value

        if (!email) {
          return done(null, false, { message: 'Email not found' })
        }

        // Controlla se l'email è nella lista degli utenti autorizzati
        const isAuthorized = authorizedEmails.includes(email)

        if (!isAuthorized) {
          return done(null, false, { message: 'Unauthorized email' })
        }

        // Crea un oggetto utente con le informazioni rilevanti
        const user = {
          id: profile.id,
          email: email,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value
        }

        return done(null, user)
      }
    )
  )

  // Serializzazione dell'utente nella sessione
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  // Deserializzazione dell'utente dalla sessione
  passport.deserializeUser((user, done) => {
    done(null, user)
  })
}

export default passport
