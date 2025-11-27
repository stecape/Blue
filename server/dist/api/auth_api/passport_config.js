"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = exports.setDbPool = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Lista degli utenti autorizzati (email)
const authorizedEmails = process.env.AUTHORIZED_EMAILS
    ? process.env.AUTHORIZED_EMAILS.split(',').map(email => email.trim())
    : [];
// Variabile per il pool del database
let dbPool = null;
// Funzione per impostare il pool del database
const setDbPool = (pool) => {
    dbPool = pool;
};
exports.setDbPool = setDbPool;
// Funzione per trovare o creare un utente nel database
const findOrCreateUser = async (profile, provider = 'google') => {
    if (!dbPool) {
        throw new Error('Database pool not initialized');
    }
    const email = profile.emails?.[0]?.value;
    const providerUserId = profile.id;
    const name = profile.displayName;
    const picture = profile.photos?.[0]?.value;
    try {
        // 1. Cerca se l'utente esiste già nella tabella User
        const userResult = await dbPool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        let userId;
        if (userResult.rows.length > 0) {
            // Utente esiste già
            userId = userResult.rows[0].id;
            // Aggiorna eventualmente nome e immagine se sono cambiati
            await dbPool.query('UPDATE "User" SET name = $1, picture = $2 WHERE id = $3', [name, picture, userId]);
        }
        else {
            // Crea nuovo utente con ruolo 'user'
            const newUserResult = await dbPool.query('INSERT INTO "User" (email, name, picture, role) VALUES ($1, $2, $3, $4) RETURNING *', [email, name, picture, 'user']);
            userId = newUserResult.rows[0].id;
        }
        // 2. Verifica se esiste già l'identità per questo provider
        const identityResult = await dbPool.query('SELECT * FROM "User_Identities" WHERE user_id = $1 AND provider = $2', [userId, provider]);
        if (identityResult.rows.length === 0) {
            // Crea nuova identità
            await dbPool.query('INSERT INTO "User_Identities" (user_id, provider, provider_user_id) VALUES ($1, $2, $3)', [userId, provider, providerUserId]);
        }
        else {
            // Aggiorna provider_user_id se è cambiato
            await dbPool.query('UPDATE "User_Identities" SET provider_user_id = $1 WHERE user_id = $2 AND provider = $3', [providerUserId, userId, provider]);
        }
        // 3. Recupera l'utente completo dal DB
        const finalUserResult = await dbPool.query('SELECT * FROM "User" WHERE id = $1', [userId]);
        return finalUserResult.rows[0];
    }
    catch (error) {
        console.error('Error in findOrCreateUser:', error);
        throw error;
    }
};
const configurePassport = () => {
    // Strategia Google OAuth 2.0
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Verifica se l'email dell'utente è autorizzata
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(null, false, { message: 'Email not found' });
            }
            // Controlla se l'email è nella lista degli utenti autorizzati
            const isAuthorized = authorizedEmails.includes(email);
            if (!isAuthorized) {
                return done(null, false, { message: 'Unauthorized email' });
            }
            // Trova o crea l'utente nel database
            const user = await findOrCreateUser(profile, 'google');
            return done(null, user);
        }
        catch (error) {
            console.error('Error in Google Strategy:', error);
            return done(error, null);
        }
    }));
    // Serializzazione dell'utente nella sessione (salva solo l'ID)
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserializzazione dell'utente dalla sessione (recupera dal DB)
    passport_1.default.deserializeUser(async (id, done) => {
        if (!dbPool) {
            return done(new Error('Database pool not initialized'), null);
        }
        try {
            const result = await dbPool.query('SELECT * FROM "User" WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                done(null, result.rows[0]);
            }
            else {
                done(new Error('User not found'), null);
            }
        }
        catch (error) {
            console.error('Error in deserializeUser:', error);
            done(error, null);
        }
    });
};
exports.configurePassport = configurePassport;
exports.default = passport_1.default;
