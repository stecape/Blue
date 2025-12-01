import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAuthenticated } from './auth_api.js';
import {
  ErrorResponse,
  AuthenticatedRequest,
  GetDevicesRequest,
  GetDevicesResponse,
  GetUserDeviceDetailsRequest,
  GetUserDeviceDetailsResponse,
} from 'shared/types';

// API per utenti - ottiene devices e dati filtrati per l'utente loggato

export default function (app: Application, pool: Pool) {
  /**
   * Ottieni tutti i device dell'utente autenticato
   * @route POST /api/user/devices
   * @access User
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta (vuoto)
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Array di device e messaggio di conferma
   * @example
   * // Risposta
   * {
   *   result: [ { id: 1, name: 'Device1', ... }, ... ],
   *   message: "2 device(s) returned"
   * }
   */

  app.post(
    '/api/user/devices',
    isAuthenticated,
    (req: Request<GetDevicesRequest>, res: Response<GetDevicesResponse | ErrorResponse>) => {
      const { user } = req as unknown as AuthenticatedRequest;

      const queryString = `SELECT * FROM "Device" WHERE user_id = ${user.id}`;
      pool
        .query(queryString)
        .then((data) =>
          res.json({ result: data.rows, message: `${data.rowCount} device(s) returned` }),
        )
        .catch((error) => {
          console.error('Error fetching user devices:', error);
          res
            .status(500)
            .json({ code: error.code, detail: error.detail, message: 'Internal server error' });
        });
    },
  );

  /**
   * Ottieni i dettagli di un device specifico dell'utente autenticato
   * @route POST /api/user/device
   * @access User
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.deviceId - L'ID del device da cercare
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Dettaglio del device e messaggio di conferma
   * @example
   * // Richiesta
   * {
   *   deviceId: 123
   * }
   * // Risposta
   * {
   *   result: { id: 123, name: 'Device1', ... },
   *   message: "Device returned"
   * }
   */

  app.post(
    '/api/user/device',
    isAuthenticated,
    (
      req: Request<GetUserDeviceDetailsRequest>,
      res: Response<GetUserDeviceDetailsResponse | ErrorResponse>,
    ) => {
      const { user } = req as unknown as AuthenticatedRequest;
      const deviceId = req.body.deviceId;

      if (!deviceId) {
        return res.status(400).json({ result: null, message: 'deviceId is required' });
      }
      const queryString = `SELECT * FROM "Device" WHERE id = ${deviceId} AND user_id = ${user.id}`;
      pool
        .query(queryString)
        .then((data) => {
          if (data.rows.length === 0) {
            return res
              .status(400)
              .json({ result: null, message: 'Device not found or access denied' });
          }
          res.json({ result: data.rows[0], message: 'Device returned' });
        })
        .catch((error) => {
          console.error('Error fetching device:', error);
          res
            .status(500)
            .json({ code: error.code, detail: error.detail, message: 'Internal server error' });
        });
    },
  );
}
