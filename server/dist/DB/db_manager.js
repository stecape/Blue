"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnected = exports.pool = void 0;
exports.db_manager = db_manager;
const pg_1 = __importDefault(require("pg"));
const db_config_js_1 = require("./db_config.js");
const db_filler_js_1 = __importDefault(require("./db_filler.js"));
const db_listener_js_1 = __importDefault(require("./db_listener.js"));
const globalEventEmitter_js_1 = __importDefault(require("../Helpers/globalEventEmitter.js")); // Import globalEventEmitter
const connStr = `${db_config_js_1.db_dialect}://${db_config_js_1.db_user}:${db_config_js_1.db_password}@${db_config_js_1.db_host}:${db_config_js_1.db_port}/${db_config_js_1.db_name}`;
exports.dbConnected = false;
let initializePromise = null; // Promise condivisa per sincronizzare le chiamate a initialize
function initialize(pool) {
    if (initializePromise) {
        return initializePromise; // Restituisci la Promise condivisa se già in esecuzione
    }
    initializePromise = new Promise((resolve, reject) => {
        pool.connect((err, client) => {
            if (err) {
                console.error("Initialize: Pool connection attempt failed", err);
                exports.dbConnected = false;
                globalEventEmitter_js_1.default.emit('dbDisconnected'); // Emit the dbDisconnected event
                initializePromise = null; // Resetta la Promise condivisa
                setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
                return;
            }
            exports.dbConnected = true;
            globalEventEmitter_js_1.default.emit('dbConnected'); // Emit the dbConnected event
            console.log("Initialize: Pool connected");
            // Handle unexpected errors on client
            client.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
                client.release(true); // Rilascia il client e rimuovilo dal pool
                exports.dbConnected = false;
                globalEventEmitter_js_1.default.emit('dbDisconnected'); // Emit the dbDisconnected event
                initializePromise = null; // Resetta la Promise condivisa
                setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
            });
            (0, db_filler_js_1.default)(client)
                .then(() => {
                initializePromise = null; // Resetta la Promise condivisa
                resolve(client);
            })
                .catch((err) => {
                console.error("Initialize: Error filling the database", err);
                client.release(true); // Rilascia il client e rimuovilo dal pool
                exports.dbConnected = false;
                globalEventEmitter_js_1.default.emit('dbDisconnected'); // Emit the dbDisconnected event
                initializePromise = null; // Resetta la Promise condivisa
                setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
            });
        });
        // Gestisci errori imprevisti sul pool (registra solo una volta)
        if (!pool._errorHandlerRegistered) {
            console.log("Initialize: Registering error handler on pool");
            pool.on('error', (err) => {
                console.error('Unexpected error on pool', err);
                exports.dbConnected = false;
                globalEventEmitter_js_1.default.emit('dbDisconnected'); // Emit the dbDisconnected event
                initializePromise = null; // Resetta la Promise condivisa
                setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
            });
            pool._errorHandlerRegistered = true; // Segna il gestore come registrato
        }
    });
    return initializePromise;
}
function db_manager() {
    return new Promise((resolve, reject) => {
        const { Pool } = pg_1.default;
        exports.pool = new Pool({
            connectionString: connStr,
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error if a connection is not established in 2 seconds
        });
        initialize(exports.pool)
            .then((client) => {
            (0, db_listener_js_1.default)(client)
                .then(() => {
                resolve(exports.pool);
            })
                .catch((err) => {
                console.error("db_manager: Error setting up listeners", err);
                reject(err);
            });
        })
            .catch((err) => {
            console.error("db_manager: Initialization error");
            reject(err);
        });
    });
}
exports.default = { db_manager };
