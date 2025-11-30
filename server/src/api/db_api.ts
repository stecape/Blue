import globalEventEmitter from '../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAuthenticated, isAdmin } from './auth_api.js';
import device_api from './db_api/device_api.js'
import field_api from './db_api/field_api.js'
import logic_state_api from './db_api/logic_state_api.js'
import tag_api from './db_api/tag_api.js'
import template_api from './db_api/template_api.js'
import type_api from './db_api/type_api.js'
import um_api from './db_api/um_api.js'
import var_api from './db_api/var_api.js'
import user_api from './db_api/user_api.js'
import { ErrorResponse, ExecRequest, ExecResponse, GetAllRequest, GetAllResponse } from 'shared/types';

export default function (app: Application, pool: Pool) {
  device_api(app, pool)
  field_api(app, pool)
  logic_state_api(app, pool)
  tag_api(app, pool)
  template_api(app, pool)
  type_api(app, pool)
  um_api(app, pool)
  var_api(app, pool)
  user_api(app, pool)

  
  /**
   * Esegui una query SQL arbitraria (solo admin)
   * @route POST /api/exec
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {string} req.body.query - La query SQL da eseguire
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Risultato della query e messaggio di conferma
   * @example
   * // Richiesta
   * {
   *   query: "INSERT INTO \"Var\" (\"id\",\"name\",\"type\") VALUES (DEFAULT,'Temperature 2','1')"
   * }
   * // Risposta
   * {
   *   result: ..., // risultato della query
   *   message: "Query executed"
   * }
   */

  app.post('/api/exec', isAdmin, (req: Request<ExecRequest>, res: Response<ExecResponse | ErrorResponse>) => {
    const queryString : string = req.body.query
    pool.query(queryString)
    .then(data => res.json({result: data, message: "Query executed"}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })



  /**
   * Ottieni tutti i record da una tabella (autenticato - admin vede tutto, user filtrato)
   * @route POST /api/getAll
   * @access Admin/User
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {string} req.body.table - Il nome della tabella da cui estrarre i dati
   * @param {string[]} req.body.fields - Array di nomi dei campi da estrarre
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Array di record e messaggio di conferma
   * @example
   * // Richiesta
   * {
   *   table: "Var",
   *   fields: ["name", "type", "id"]
   * }
   * // Risposta
   * {
   *   result: [
   *     ["Temperature 1", 1, 131],
   *     ["Temperature 2", 1, 124],
   *     ["Temperature 3", 3, 125]
   *   ],
   *   message: "3 record(s) from table 'Var' returned correctly"
   * }
   */
  
  app.post('/api/getAll', isAuthenticated, (req: Request<GetAllRequest>, res: Response<GetAllResponse | ErrorResponse>) => {
    const queryString=`SELECT ${req.body.fields.join(',')} FROM "${req.body.table}" ORDER BY id ASC`
    pool.query(queryString)
    .then(data => res.json({result: data.rows, message: data.rowCount + ` record(s) from table "${req.body.table}" returned correctly`}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })


}