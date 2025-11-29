import { Pool, PoolClient } from 'pg'
import { db_dialect, db_user, db_password, db_host, db_port, db_name } from './db_config.js'
import db_filler from './db_filler.js'
import db_listener from './db_listener.js'
import globalEventEmitter from '../Helpers/globalEventEmitter.js' // Import globalEventEmitter

const connStr = `${db_dialect}://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`

export var pool: Pool
export var dbConnected: boolean

let initializePromise: Promise<PoolClient> | null = null; // Promise condivisa per sincronizzare le chiamate a initialize

// Track pools with registered error handlers
const poolsWithErrorHandler = new WeakSet<Pool>();

function initialize(pool: Pool) {
  if (initializePromise) {
    return initializePromise; // Restituisci la Promise condivisa se già in esecuzione
  }

  initializePromise = new Promise((resolve, reject) => {
    pool.connect((err, client) => {
      if (err) {
        console.error("Initialize: Pool connection attempt failed", err)
        dbConnected = false
        globalEventEmitter.emit('dbDisconnected') // Emit the dbDisconnected event
        initializePromise = null; // Resetta la Promise condivisa
        setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
        return;
      }

      dbConnected = true
      globalEventEmitter.emit('dbConnected') // Emit the dbConnected event
      console.log("Initialize: Pool connected")

      // Handle unexpected errors on client
      if (client) {
        client.on('error', (err) => {
          console.error('Unexpected error on idle client', err)
          client.release(true) // Rilascia il client e rimuovilo dal pool
          dbConnected = false;
          globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
          initializePromise = null; // Resetta la Promise condivisa
          setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
        })
      }

      if (client) {
        db_filler(client)
          .then(() => {
            initializePromise = null; // Resetta la Promise condivisa
            resolve(client);
          })
          .catch((err) => {
            console.error("Initialize: Error filling the database", err);
            client.release(true); // Rilascia il client e rimuovilo dal pool
            dbConnected = false;
            globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
            initializePromise = null; // Resetta la Promise condivisa
            setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
          });
      } else {
        reject(new Error("Pool connected but client is undefined"));
      }
    });

    // Gestisci errori imprevisti sul pool (registra solo una volta)
    if (!poolsWithErrorHandler.has(pool)) {
      console.log("Initialize: Registering error handler on pool")
      pool.on('error', (err) => {
        console.error('Unexpected error on pool', err);
        dbConnected = false;
        globalEventEmitter.emit('dbDisconnected'); // Emit the dbDisconnected event
        initializePromise = null; // Resetta la Promise condivisa
        setTimeout(() => initialize(pool).then(resolve).catch(reject), 5000); // Retry after 5 seconds
      });
      poolsWithErrorHandler.add(pool); // Segna il gestore come registrato
    }
  });

  return initializePromise;
}

export function db_manager() {
  return new Promise((resolve, reject) => {
    pool = new Pool({
      connectionString: connStr,
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error if a connection is not established in 2 seconds
    })
    
    initialize(pool)
      .then((client) => {
        db_listener(client)
          .then(() => {
            resolve(pool)
          })
          .catch((err) => {
            console.error("db_manager: Error setting up listeners", err)
            reject(err);
          })
      })
      .catch((err) => {
        console.error("db_manager: Initialization error")
        reject(err);
      })
  })
}

export default { db_manager }
