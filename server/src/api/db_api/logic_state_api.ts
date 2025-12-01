import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import {
  ErrorResponse,
  AddLogicStateRequest,
  AddLogicStateResponse,
  ModifyLogicStateRequest,
  ModifyLogicStateResponse,
  RemoveLogicStateRequest,
  RemoveLogicStateResponse,
} from 'shared/types';

export default function (app: Application, pool: Pool) {
  /**
   * Aggiungi uno stato logico (LogicState)
   * @route POST /api/addLogicState
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {string} req.body.name - Il nome dello stato logico
   * @param {string[]} req.body.value - Array di valori dello stato logico
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Stato logico inserito e messaggio di conferma
   */

  app.post(
    '/api/addLogicState',
    isAdmin,
    (req: Request<AddLogicStateRequest>, res: Response<AddLogicStateResponse | ErrorResponse>) => {
      const queryString = `INSERT INTO "LogicState" (id, name, value) VALUES (DEFAULT,'${req.body.name}',ARRAY[${req.body.value.map((item: string) => `'${item}'`)}])`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows[0], message: 'LogicState inserted' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Modifica uno stato logico (LogicState)
   * @route POST /api/modifyLogicState
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID dello stato logico da modificare
   * @param {string} req.body.name - Il nuovo nome dello stato logico
   * @param {string[]} req.body.value - Il nuovo array di valori dello stato logico
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Stato logico aggiornato e messaggio di conferma
   */

  app.post(
    '/api/modifyLogicState',
    isAdmin,
    (
      req: Request<ModifyLogicStateRequest>,
      res: Response<ModifyLogicStateResponse | ErrorResponse>,
    ) => {
      const queryString = `UPDATE "LogicState" SET name='${req.body.name}', value=ARRAY[${req.body.value.map((item: string) => `'${item}'`)}] WHERE id = ${req.body.id}`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows[0], message: 'Logic State updated' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Elimina uno stato logico (LogicState)
   * @route POST /api/removeLogicState
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID dello stato logico da eliminare
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma dell'eliminazione
   */

  app.post(
    '/api/removeLogicState',
    isAdmin,
    (
      req: Request<RemoveLogicStateRequest>,
      res: Response<RemoveLogicStateResponse | ErrorResponse>,
    ) => {
      const queryString = `DELETE FROM "LogicState" WHERE id = ${req.body.id};`;
      pool
        .query(queryString)
        .then((data) =>
          res.json({ result: data.rows, message: 'Record correctly removed from LogicState ' }),
        )
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );
}
