import globalEventEmitter from '../../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import { ErrorResponse, GetVarsRequest, GetVarsResponse, GetVarsResult, TempVar, DBVar } from 'shared/types';

export default function (app: Application, pool: Pool) {


  /**
   * Ottieni tutte le variabili (Vars) per un template
   * @route POST /api/getVars
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.template - L'ID del template di cui ottenere le variabili
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Oggetto con nome del template, id e array di variabili, più un messaggio di conferma
   * @example
   * // Richiesta
   * {
   *   template: 1
   * }
   * // Risposta
   * {
   *   result: {
   *     name: "Template1",
   *     template: 1,
   *     vars: [
   *       { id: 1, name: 'Power', type: 7, template: 'Template1', um: 'kW', logic_state: 'Active', comment: 'Main power variable', QRef: 0 },
   *       ...
   *     ]
   *   },
   *   message: "Vars retrieved successfully"
   * }
   */
  
  app.post('/api/getVars', isAdmin, (req: Request<GetVarsRequest>, res: Response<GetVarsResponse | ErrorResponse>) => {
    let queryString = `SELECT * FROM "Var" WHERE template = ${req.body.template} ORDER BY id`;

    pool.query(queryString)
      .then(data => {
        const db_vars: DBVar[] = data.rows;
        const vars: TempVar[] = db_vars.map((v, i) => ({
          id: v.id,
          type: v.type,
          name: v.name,
          template: v.template,
          fixed_id: v.fixed_id,
          um: v.um,
          logic_state: v.logic_state,
          comment: v.comment,
          QRef: i
        }));

        // Recupera il nome del template
        const templateQuery = `SELECT name FROM "Template" WHERE id = ${req.body.template}`;
        return pool.query(templateQuery)
        .then(templateData => {
          const templateName = templateData.rows[0] ? templateData.rows[0].name : "Unknown Template";

          // Costruisce l'oggetto di risposta
          const response: GetVarsResult = {
            name: templateName,
            template: req.body.template,
            vars: vars,
          };

          res.json({ result: response, message: "Vars retrieved successfully" });
        });
      })
      .catch(error => {
        res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
      });
  });
}