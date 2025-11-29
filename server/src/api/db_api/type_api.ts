import globalEventEmitter from '../../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import { ErrorResponse, RemoveTypeRequest, RemoveTypeResponse } from 'shared/types';

export default function (app: Application, pool: Pool) {


  /**
   * Elimina un tipo (Type)
   * @route POST /api/removeType
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID del tipo da eliminare
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma dell'eliminazione
   * @example
   * // Richiesta
   * {
   *   id: 182
   * }
   * // Risposta
   * {
   *   result: ..., // dati della rimozione
   *   message: "Record correctly removed from table 'Type'"
   * }
   */
  
  app.post('/api/removeType', isAdmin, (req: Request<RemoveTypeRequest>, res: Response<RemoveTypeResponse | ErrorResponse>) => {
    const queryString=`DELETE FROM "Field" WHERE parent_type = ${req.body.id}; DELETE FROM "Type" WHERE id = ${req.body.id}`
    pool.query(queryString)
    .then(data=> res.json({result: data.rows[0], message: `Record correctly removed from table "${req.body.table}"`}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })

}