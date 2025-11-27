"use strict";
// API per utenti - ottiene devices e dati filtrati per l'utente loggato
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
// Middleware per verificare autenticazione
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};
function default_1(app, pool) {
    /*
    Get user devices
    Type:   POST
    Route:  '/api/user/devices'
    Body:   {}
    Query:  SELECT * FROM "Device" WHERE user_id = <userId>
    Res:    200, { devices: [...] }
    Err:    401, 500
    */
    app.post('/api/user/devices', isAuthenticated, (req, res) => {
        const userId = req.user.id;
        pool.query('SELECT * FROM "Device" WHERE user_id = $1 ORDER BY id ASC', [userId])
            .then(data => res.json({ devices: data.rows, message: `${data.rowCount} device(s) returned` }))
            .catch(error => {
            console.error('Error fetching user devices:', error);
            res.status(500).json({ code: error.code, detail: error.detail, message: 'Internal server error' });
        });
    });
    /*
    Get specific device details
    Type:   POST
    Route:  '/api/user/device'
    Body:   { deviceId: 123 }
    Query:  SELECT * FROM "Device" WHERE id = <deviceId> AND user_id = <userId>
    Res:    200, { device: {...} }
    Err:    401, 404, 500
    */
    app.post('/api/user/device', isAuthenticated, (req, res) => {
        const userId = req.user.id;
        const deviceId = req.body.deviceId;
        if (!deviceId) {
            return res.status(400).json({ error: 'deviceId is required' });
        }
        pool.query('SELECT * FROM "Device" WHERE id = $1 AND user_id = $2', [deviceId, userId])
            .then(data => {
            if (data.rows.length === 0) {
                return res.status(404).json({ error: 'Device not found or access denied' });
            }
            res.json({ device: data.rows[0], message: 'Device returned' });
        })
            .catch(error => {
            console.error('Error fetching device:', error);
            res.status(500).json({ code: error.code, detail: error.detail, message: 'Internal server error' });
        });
    });
}
