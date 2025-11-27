"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_ws_js_1 = __importDefault(require("./App/app_ws.js"));
const db_manager_js_1 = require("./DB/db_manager.js");
const app_wsMessageBroker_js_1 = __importDefault(require("./App/app_wsMessageBroker.js"));
const backend_api_js_1 = __importDefault(require("./api/backend_api.js"));
const db_api_js_1 = __importDefault(require("./api/db_api.js"));
const mqtt_api_js_1 = __importDefault(require("./api/mqtt_api.js"));
const controls_api_js_1 = __importDefault(require("./api/controls_api.js"));
const auth_api_js_1 = __importDefault(require("./api/auth_api.js"));
const user_app_api_js_1 = __importDefault(require("./api/user_app_api.js"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PostgresStore = (0, connect_pg_simple_1.default)(express_session_1.default);
const startApp = () => {
    //initialize the WebSocket server and the express app
    const { connection, expressApp } = (0, app_ws_js_1.default)();
    // Trust proxy - necessario quando si è dietro nginx
    expressApp.set('trust proxy', 1);
    //initialize the WebSocket message broker, that collects the messages from the globalEventEmitter (backend internal emitter) and sends them to the clients that are destinated to the WebSocket
    (0, app_wsMessageBroker_js_1.default)(connection);
    //initialize the database manager
    (0, db_manager_js_1.db_manager)()
        .then((pool) => {
        // Configurazione sessioni con PostgreSQL
        expressApp.use((0, express_session_1.default)({
            store: new PostgresStore({
                pool: pool,
                tableName: 'session',
                createTableIfMissing: true
            }),
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 24 ore
                sameSite: 'lax'
            }
        }));
        // IMPORTANTE: auth_api deve essere chiamato PRIMA delle altre API
        // perché inizializza Passport
        (0, auth_api_js_1.default)(expressApp, pool);
        // Ora registra le altre API che usano isAuthenticated/isAdmin
        (0, backend_api_js_1.default)(expressApp);
        (0, db_api_js_1.default)(expressApp, pool);
        (0, mqtt_api_js_1.default)(expressApp, pool);
        (0, controls_api_js_1.default)(expressApp, pool);
        (0, user_app_api_js_1.default)(expressApp, pool);
    })
        .catch(() => {
        console.error('Index: Error connecting to the database');
    });
};
startApp();
// Global error handling. In case of an unhandled error or unhandled rejection, close the WebSocket server, close the DB, and retry after 5 seconds
/*
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception: ', err)
  // Close WebSocket server before retrying
  close()
  setTimeout(startApp, 5000) // Retry after 5 seconds
})

 process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Close WebSocket server before retrying
  close()
  setTimeout(startApp, 5000) // Retry after 5 seconds
})
*/ 
