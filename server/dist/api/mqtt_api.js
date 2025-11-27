"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttClient = void 0;
exports.default = default_1;
const globalEventEmitter_js_1 = __importDefault(require("../Helpers/globalEventEmitter.js"));
const mqtt_1 = __importDefault(require("mqtt"));
const app_config_js_1 = require("../App/app_config.js");
const auth_api_js_1 = require("./auth_api.js");
exports.mqttClient = { connected: false };
function default_1(app, pool) {
    let devices = [];
    exports.mqttClient = mqtt_1.default.connect("mqtt://www.stecape.space:1883", {
        clientId: app_config_js_1.mqtt_client_id, // Opzionale: identificativo del client
        clean: true, // Opzionale: indica se il broker deve mantenere lo stato del client
    });
    // Funzione per recuperare l'elenco dei dispositivi dal database
    const getDevices = async () => {
        const query = 'SELECT name FROM "Device"';
        try {
            const result = await pool.query(query);
            return result.rows.map(row => row.name);
        }
        catch (err) {
            console.error("Error fetching devices from DB:", err);
            return [];
        }
    };
    // Funzione per eseguire la subscription per ogni dispositivo
    const subscribeToDevices = async () => {
        exports.mqttClient.subscribe(`/birth`, (err) => {
            if (!err) {
                console.log(`Subscribed to /birth`);
            }
            else {
                console.error(`Failed to subscribe to /birth:`, err);
            }
        });
        exports.mqttClient.subscribe(`/lwt`, (err) => {
            if (!err) {
                console.log(`Subscribed to /lwt`);
            }
            else {
                console.error(`Failed to subscribe to /lwt:`, err);
            }
        });
        devices = await getDevices();
        devices.forEach(device => {
            exports.mqttClient.subscribe(`/feedback/${device}`, (err) => {
                if (!err) {
                    console.log(`Subscribed to /feedback/${device}`);
                }
                else {
                    console.error(`Failed to subscribe to /feedback/${device}:`, err);
                }
            });
        });
    };
    // Funzione per annullare tutte le subscription
    const unsubscribeFromAllDevices = async () => {
        exports.mqttClient.unsubscribe(`/feedback/#`, (err) => {
            if (!err) {
                console.log(`Unsubscribed from /feedback/#`);
            }
            else {
                console.error(`Failed to unsubscribe from /feedback/#:`, err);
            }
        });
    };
    //emissione di eventi per comunicare al client lo stato della connessione
    exports.mqttClient.on("connect", async () => {
        console.log("Connected to MQTT broker");
        globalEventEmitter_js_1.default.emit('mqttConnected');
        await subscribeToDevices();
        devices.forEach(device => {
            //request the HMI values
            exports.mqttClient.publish(`/command/${device}`, JSON.stringify({ id: 0, value: 2 }));
            //request the Ping to get the status of the device
            exports.mqttClient.publish(`/command/${device}`, JSON.stringify({ id: 0, value: 3 }));
            //request the actual device time to store the shifting from the server in the database
            exports.mqttClient.publish(`/command/${device}`, JSON.stringify({ id: 0, value: 5 }));
        });
        //ask for a refresh of the HMI values with the payload {id: 0, value: 2} to all the devices in the table "Device"
    });
    exports.mqttClient.on("error", () => {
        globalEventEmitter_js_1.default.emit('mqttDisconnected');
    });
    exports.mqttClient.on("close", () => {
        globalEventEmitter_js_1.default.emit('mqttDisconnected');
    });
    exports.mqttClient.on("end", () => {
        globalEventEmitter_js_1.default.emit('mqttDisconnected');
    });
    exports.mqttClient.on("disconnect", () => {
        globalEventEmitter_js_1.default.emit('mqttDisconnected');
    });
    //
    const mqttWrite = (device, command) => {
        console.log(command);
        exports.mqttClient.publish(`/command/${device}`, JSON.stringify(command));
    };
    /*
    Write a tag value to controller
    Type:   POST
    Route:  '/api/mqtt/write'
    Body:   {
              id: 45,
              value: 49.5
            }
    Res:    200
    Err:    400
    */
    app.post('/api/mqtt/write', auth_api_js_1.isAuthenticated, (req, res) => {
        console.log({ device: req.body.device, id: req.body.id, value: req.body.value });
        mqttWrite(req.body.device, { id: req.body.id, value: req.body.value });
        res.json({ result: { device: req.body.device, id: req.body.id, value: req.body.value }, message: "Message sent" });
    });
    /*
      Acknowledge the alarms on each device
      Type:   POST
      Route:  '/api/mqtt/alarms_ack'
      Body:   {
                id: 0,
                value: 4
              }
      Res:    200
      */
    app.post('/api/mqtt/alarms_ack', auth_api_js_1.isAuthenticated, (req, res) => {
        devices.forEach(device => {
            exports.mqttClient.publish(`/command/${device}`, JSON.stringify({ id: 0, value: 4 }));
        });
        res.json({ result: { status: "ack done" }, message: "Message sent" });
    });
    /*
    {
    "id":615,
    "value": 23
    }
    */
    exports.mqttClient.on("message", async (topic, message) => {
        try {
            const payload = message.toString();
            const data = JSON.parse(payload); // Attempt to parse the message payload
            if (topic === "/birth") {
                // Update the status of the device in the "Device" table to 1
                const updateQuery = `UPDATE "Device" SET status = 1 WHERE name = $1`;
                try {
                    await pool.query(updateQuery, [data.deviceId]);
                    console.log(`Device ${data.deviceId} status updated to 1`);
                    // Publish the command to get the HMI values
                    await exports.mqttClient.publish(`/command/${data.deviceId}`, JSON.stringify({ id: 0, value: 2 }));
                    // Publish the command to get the device time
                    await exports.mqttClient.publish(`/command/${data.deviceId}`, JSON.stringify({ id: 0, value: 5 }));
                }
                catch (err) {
                    console.error(`Failed to update status for device ${data.deviceId}:`, err);
                }
            }
            else if (topic === "/lwt") {
                // Update the status of the device in the "Device" table to 0
                console.log(`Device ${data.deviceId} went offline`);
                const updateQuery = `UPDATE "Device" SET status = 0 WHERE name = $1`;
                try {
                    await pool.query(updateQuery, [data.deviceId]);
                    console.log(`Device ${data.deviceId} status updated to 0`);
                }
                catch (err) {
                    console.error(`Failed to update status for device ${data.deviceId}:`, err);
                }
            }
            else {
                // Handle other topics
                if (data && (data.id !== undefined && data.value !== undefined) || data.deviceId !== undefined) { // Validate the parsed data
                    if (data.id == 0) {
                        if (data.value == 3) {
                            // Update the status of the device in the "Device" table to 1
                            const updateQuery = `UPDATE "Device" SET status = 1 WHERE name = $1`;
                            try {
                                await pool.query(updateQuery, [data.deviceId]);
                                console.log(`Device ${data.deviceId} status updated to 1`);
                            }
                            catch (err) {
                                console.error(`Failed to update status for device ${data.deviceId}:`, err);
                            }
                        }
                        else if (data.value == 5) {
                            // Update the time shifting of the device relative to server utc in the "Device" table
                            const updateQuery = `UPDATE "Device" SET utc_offset = $1 WHERE name = $2`;
                            try {
                                const serverTime = Date.now(); // Current server UTC timestamp in milliseconds
                                const timeDifference = serverTime - data.utc_offset; // Calculate the time difference
                                await pool.query(updateQuery, [timeDifference, data.deviceId]);
                            }
                            catch (err) {
                                console.error(`Failed to update time for device ${data.deviceId}:`, err);
                            }
                        }
                    }
                    else {
                        // Update the value of the tag in the "Tag" table usando fixed_id
                        const queryString = `UPDATE "Tag" SET value = '${JSON.stringify({ value: data.value })}' WHERE fixed_id = ${data.id}`;
                        pool.query({
                            text: queryString,
                            rowMode: 'array',
                        });
                    }
                }
                else {
                    console.error("Invalid data format received:", data);
                }
            }
        }
        catch (err) {
            console.error("Failed to process MQTT message:", err.message, "Message:", message.toString());
        }
    });
    // Ascolta gli eventi emessi dalla CRUD API
    globalEventEmitter_js_1.default.on('deviceAdded', async () => {
        await unsubscribeFromAllDevices();
        await subscribeToDevices();
    });
    globalEventEmitter_js_1.default.on('deviceUpdated', async () => {
        await unsubscribeFromAllDevices();
        await subscribeToDevices();
    });
    globalEventEmitter_js_1.default.on('deviceDeleted', async () => {
        await unsubscribeFromAllDevices();
        await subscribeToDevices();
    });
}
