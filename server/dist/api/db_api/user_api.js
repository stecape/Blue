"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const globalEventEmitter_js_1 = __importDefault(require("../../Helpers/globalEventEmitter.js"));
const auth_api_js_1 = require("../auth_api.js");
function default_1(app, pool) {
    /**
     * Ottieni tutti gli utenti
     * @route GET /api/getUsers
     * @param {Object} req - La richiesta HTTP.
     * @param {Object} res - La risposta HTTP.
     * @returns {Object} - Un array di utenti e un messaggio di conferma.
     */
    /**
     * Modifica un utente
     * @route POST /api/modifyUser
     * @param {Object} req - La richiesta HTTP.
     * @param {Object} req.body - Il corpo della richiesta.
     * @param {number} req.body.id - L'ID dell'utente da modificare.
     * @param {string} req.body.name - Il nuovo nome dell'utente.
     * @param {string} req.body.email - La nuova email dell'utente.
     * @param {string} req.body.role - Il nuovo ruolo dell'utente ('admin' o 'user').
     * @param {Object} res - La risposta HTTP.
     * @returns {Object} - Un messaggio di conferma.
     */
    /**
     * Elimina un utente
     * @route POST /api/removeUser
     * @param {Object} req - La richiesta HTTP.
     * @param {Object} req.body - Il corpo della richiesta.
     * @param {number} req.body.id - L'ID dell'utente da eliminare.
     * @param {Object} res - La risposta HTTP.
     * @returns {Object} - Un messaggio di conferma.
     */
    // Ottieni tutti gli utenti (solo admin)
    app.get('/api/getUsers', auth_api_js_1.isAdmin, (req, res) => {
        const queryString = `SELECT id, email, name, picture, role FROM "User" ORDER BY id`;
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => {
            res.json({ result: data.rows, message: "Users retrieved" });
        })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
    // Modifica un utente (solo admin)
    app.post('/api/modifyUser', auth_api_js_1.isAdmin, (req, res) => {
        const { id, name, email, role } = req.body;
        const queryString = `UPDATE "User" SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, email, name, role`;
        pool.query({
            text: queryString,
            values: [name, email, role, id]
        })
            .then(data => {
            globalEventEmitter_js_1.default.emit('userUpdated', { userId: id });
            res.json({ result: data.rows[0], message: "User updated" });
        })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
    // Elimina un utente (solo admin)
    app.post('/api/removeUser', auth_api_js_1.isAdmin, (req, res) => {
        const queryString = `DELETE FROM "User" WHERE id = $1`;
        pool.query({
            text: queryString,
            values: [req.body.id]
        })
            .then(data => {
            globalEventEmitter_js_1.default.emit('userDeleted', { userId: req.body.id });
            res.json({ result: data.rows[0], message: "User deleted" });
        })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
}
