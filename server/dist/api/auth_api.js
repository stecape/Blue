"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_config_js_1 = require("./auth_api/passport_config.js");
const router = express_1.default.Router();
// Middleware per verificare se l'utente è autenticato
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ authenticated: false, message: 'Not authenticated' });
};
exports.isAuthenticated = isAuthenticated;
// Middleware per verificare se l'utente è admin
const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ authenticated: false, message: 'Not authenticated' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};
exports.isAdmin = isAdmin;
// Route per iniziare il processo di autenticazione con Google
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
// Route di callback dopo l'autenticazione Google
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/unauthorized`
}), (req, res) => {
    // Autenticazione riuscita, reindirizza alla home
    res.redirect(`${process.env.CLIENT_URL}/`);
});
// Route per il logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Session destruction failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});
// Route per verificare lo stato di autenticazione
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: req.user
        });
    }
    else {
        res.json({
            authenticated: false
        });
    }
});
// Funzione per inizializzare le API di autenticazione
const auth_api = (app, pool) => {
    // Configura Passport prima di usare le routes
    (0, passport_config_js_1.setDbPool)(pool);
    (0, passport_config_js_1.configurePassport)();
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Registra le routes
    app.use('/auth', router);
};
exports.default = auth_api;
