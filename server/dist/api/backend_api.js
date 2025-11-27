"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const db_manager_js_1 = require("../DB/db_manager.js");
const mqtt_api_js_1 = require("./mqtt_api.js");
const auth_api_js_1 = require("./auth_api.js");
function default_1(app) {
    app.get('/', (req, res) => {
        console.log('express connection');
        res.status(200).send('<p>Express.js BackEnd Server. Ciao!</p>');
    });
    /*
    * Get Backend Status
    * This API returns the status of the backend
    */
    app.post('/api/getBackendStatus', auth_api_js_1.isAuthenticated, (req, res) => {
        res.json({
            result: {
                dbConnected: db_manager_js_1.dbConnected,
                mqttConnected: mqtt_api_js_1.mqttClient.connected
            },
            message: "Backend Status retrieved"
        });
    });
}
