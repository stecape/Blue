import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import {
  ErrorResponse,
  AddUmRequest,
  AddUmResponse,
  ModifyUmRequest,
  ModifyUmResponse,
  RemoveUmRequest,
  RemoveUmResponse,
} from 'shared/types';

export default function (app: Application, pool: Pool) {
  /**
   * Aggiungi una unità di misura (Um)
   * @route POST /api/addUm
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {string} req.body.name - Il nome della unità di misura
   * @param {string} req.body.metric - Il simbolo metrico
   * @param {string} req.body.imperial - Il simbolo imperiale
   * @param {number} req.body.gain - Il fattore di conversione
   * @param {number} req.body.offset - L'offset di conversione
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Unità di misura inserita e messaggio di conferma
   */

  app.post(
    '/api/addUm',
    isAdmin,
    (req: Request<AddUmRequest>, res: Response<AddUmResponse | ErrorResponse>) => {
      const queryString = `INSERT INTO "um" (id, name, metric, imperial, gain, "offset") VALUES (DEFAULT,'${req.body.name}','${req.body.metric}','${req.body.imperial}',${req.body.gain},${req.body.offset})`;
      pool
        .query(queryString)
        .then((data) => {
          res.json({ result: data.rows[0], message: 'Um inserted' });
        })
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Modifica una unità di misura (Um)
   * @route POST /api/modifyUm
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID della unità di misura da modificare
   * @param {string} req.body.name - Il nuovo nome della unità di misura
   * @param {string} req.body.metric - Il nuovo simbolo metrico
   * @param {string} req.body.imperial - Il nuovo simbolo imperiale
   * @param {number} req.body.gain - Il nuovo fattore di conversione
   * @param {number} req.body.offset - Il nuovo offset di conversione
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Unità di misura aggiornata e messaggio di conferma
   */

  app.post(
    '/api/modifyUm',
    isAdmin,
    (req: Request<ModifyUmRequest>, res: Response<ModifyUmResponse | ErrorResponse>) => {
      const queryString = `UPDATE "um" SET name='${req.body.name}', metric='${req.body.metric}', imperial='${req.body.imperial}', gain=${req.body.gain}, "offset"=${req.body.offset} WHERE id = ${req.body.id}`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows[0], message: 'Um updated' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Elimina una unità di misura (Um)
   * @route POST /api/removeUm
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID della unità di misura da eliminare
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma dell'eliminazione
   */

  app.post(
    '/api/removeUm',
    isAdmin,
    (req: Request<RemoveUmRequest>, res: Response<RemoveUmResponse | ErrorResponse>) => {
      const queryString = `DELETE FROM "um" WHERE id = ${req.body.id};`;
      pool
        .query(queryString)
        .then((data) =>
          res.json({
            result: data.rows,
            message: `Record correctly removed from table "${req.body.table}"`,
          }),
        )
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );
}
