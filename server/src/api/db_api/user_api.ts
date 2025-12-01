import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import {
  ErrorResponse,
  ModifyUserRequest,
  ModifyUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  RemoveUserRequest,
  RemoveUserResponse,
} from 'shared/types';

export default function (app: Application, pool: Pool) {
  /**
   * Ottieni tutti gli utenti
   * @route GET /api/getUsers
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un array di utenti e un messaggio di conferma.
   */

  // Ottieni tutti gli utenti (solo admin)
  app.get(
    '/api/getUsers',
    isAdmin,
    (req: Request<GetUsersRequest>, res: Response<GetUsersResponse | ErrorResponse>) => {
      const queryString = `SELECT id, email, name, picture, role FROM "User" ORDER BY id`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows, message: 'Users retrieved' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Modifica un utente
   * @route POST /api/modifyUser
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {number} req.body.id - L'ID dell'utente da modificare.
   * @param {string} req.body.name - Il nuovo nome dell'utente.
   * @param {string} req.body.email - La nuova email dell'utente.
   * @param {string} req.body.role - Il nuovo ruolo dell'utente ('admin' o 'user').
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un messaggio di conferma.
   */

  // Modifica un utente (solo admin)
  app.post(
    '/api/modifyUser',
    isAdmin,
    (req: Request<ModifyUserRequest>, res: Response<ModifyUserResponse | ErrorResponse>) => {
      const queryString = `UPDATE "User" SET name = ${req.body.name}, email = ${req.body.email}, role = ${req.body.role} WHERE id = ${req.body.id} RETURNING id, email, name, role`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows[0], message: 'User updated' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );

  /**
   * Elimina un utente
   * @route POST /api/removeUser
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {number} req.body.id - L'ID dell'utente da eliminare.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un messaggio di conferma.
   */

  // Elimina un utente (solo admin)
  app.post(
    '/api/removeUser',
    isAdmin,
    (req: Request<RemoveUserRequest>, res: Response<RemoveUserResponse | ErrorResponse>) => {
      const queryString = `DELETE FROM "User" WHERE id = ${req.body.id}`;
      pool
        .query(queryString)
        .then((data) => res.json({ result: data.rows[0], message: 'User deleted' }))
        .catch((error) =>
          res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }),
        );
    },
  );
}
