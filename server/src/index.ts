import app_ws from './App/app_ws.js';
import { db_manager } from './DB/db_manager.js';
import app_wsMessageBroker from './App/app_wsMessageBroker.js';
import backend_api from './api/backend_api.js';
import db_api from './api/db_api.js';
import mqtt_api from './api/mqtt_api.js';
import controls_api from './api/controls_api.js';
import auth_api from './api/auth_api.js';
import user_app_api from './api/user_app_api.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';

dotenv.config();

const PostgresStore = pgSession(session);

const startApp = () => {
  //initialize the WebSocket server and the express app
  const { connection, expressApp } = app_ws();

  // Trust proxy - necessario quando si è dietro nginx
  expressApp.set('trust proxy', 1);

  //initialize the WebSocket message broker, that collects the messages from the globalEventEmitter (backend internal emitter) and sends them to the clients that are destinated to the WebSocket
  app_wsMessageBroker(connection);

  //initialize the database manager
  db_manager()
    .then((pool) => {
      // Configurazione sessioni con PostgreSQL
      expressApp.use(
        session({
          store: new PostgresStore({
            pool: pool,
            tableName: 'session',
            createTableIfMissing: true,
          }),
          secret: process.env.SESSION_SECRET || 'your-secret-key',
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 24 ore
            sameSite: 'lax',
          },
        }),
      );

      // IMPORTANTE: auth_api deve essere chiamato PRIMA delle altre API
      // perché inizializza Passport
      auth_api(expressApp, pool);

      // Ora registra le altre API che usano isAuthenticated/isAdmin
      backend_api(expressApp);
      db_api(expressApp, pool);
      mqtt_api(expressApp, pool);
      controls_api(expressApp, pool);
      user_app_api(expressApp, pool);
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
