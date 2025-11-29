import globalEventEmitter from '../../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAuthenticated, isAdmin } from '../auth_api.js';
import { AuthenticatedRequest, ErrorResponse, AddDeviceRequest, AddDeviceResponse, ModifyDeviceRequest, ModifyDeviceResponse, GetDevicesRequest, GetDevicesResponse, RemoveDeviceRequest, RemoveDeviceResponse } from 'shared/types';

export default function (app: Application, pool: Pool) {



  /**
   * Aggiungi un dispositivo
   * @route POST /api/addDevice
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {string} req.body.name - Il nome del dispositivo da aggiungere
   * @param {number} req.body.user_id - L'ID dell'utente proprietario
   * @param {number} req.body.template - Il template del dispositivo
   * @param {Object} res - La risposta HTTP
   * @returns {Object} L'ID del dispositivo aggiunto e un messaggio di conferma
   */

  // Aggiungi un dispositivo (solo admin)
  app.post('/api/addDevice', isAdmin, (req: Request<AddDeviceRequest>, res: Response<AddDeviceResponse | ErrorResponse>) => {
    const userIdValue = (req.body.user_id !== undefined && req.body.user_id !== null && req.body.user_id !== 0) ? req.body.user_id : 'NULL';
    const queryString = `INSERT INTO "Device" (id, name, user_id, template, status) VALUES (DEFAULT, '${req.body.name}', ${userIdValue}, '${req.body.template}', 0) RETURNING id`;
    pool.query({
      text: queryString
    })
    .then(data => {
      globalEventEmitter.emit('deviceAdded')
      globalEventEmitter.emit('refreshTags', { deviceId: req.body.id })
      const id: number = data.rows[0].id;
      res.json({ result: id, message: "Device inserted" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });


  /**
   * Modifica un dispositivo
   * @route POST /api/modifyDevice
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID del dispositivo da modificare
   * @param {string} req.body.name - Il nuovo nome del dispositivo
   * @param {number} req.body.template - Il nuovo template del dispositivo
   * @param {number} req.body.user_id - Il nuovo user_id del dispositivo
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma
   */

  // Modifica un dispositivo (solo admin)
  app.post('/api/modifyDevice', isAdmin, (req: Request<ModifyDeviceRequest>, res: Response<ModifyDeviceResponse | ErrorResponse>) => {
    const { id, name, template, user_id } = req.body;
    const queryString = `UPDATE "Device" SET name = $1, template = $2, user_id = $3 WHERE id = $4 RETURNING *`;
    pool.query({
      text: queryString,
      values: [name, template, user_id, id]
    })
    .then(data => {
      globalEventEmitter.emit('deviceUpdated')
      globalEventEmitter.emit('refreshTags', { deviceId: id })
      res.json({ result: data.rows[0], message: "Device updated" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });


  /**
   * Ottieni tutti i dispositivi
   * @route POST /api/getDevices
   * @access Admin e User
   * @param {Object} req - La richiesta HTTP
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Un array di dispositivi e un messaggio di conferma
   */

  // Ottieni tutti i dispositivi (autenticato, filtrato per ruolo)
  app.get('/api/getDevices', isAuthenticated, (req: Request<GetDevicesRequest>, res: Response<GetDevicesResponse | ErrorResponse> ) => {
    const { user } = req as unknown as AuthenticatedRequest;
    // Admin vede tutti i device, user solo i propri
    let queryString;
    if (user.role === 'admin') {
      queryString = `SELECT * FROM "Device"`;
    } else {
      // User vede solo i device che possiede
      queryString = `SELECT * FROM "Device" WHERE user_id = ${user.id}`;
    }
    
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => { res.json({ result: data.rows, message: "Devices retrieved" }) })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });
  
  
  /**
   * Elimina un dispositivo
   * @route POST /api/removeDevice
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} req.body.id - L'ID del dispositivo da eliminare
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma
   */

  // Elimina un dispositivo (solo admin)
  app.post('/api/removeDevice', isAdmin, (req: Request<RemoveDeviceRequest>, res: Response<RemoveDeviceResponse | ErrorResponse>) => {
    const queryString=`DELETE FROM "Device" WHERE id = ${req.body.id};`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      globalEventEmitter.emit('deviceDeleted')
      globalEventEmitter.emit('DeleteTags', { deviceId: req.body.id })
      res.json({ result: data.rows[0], message: "Device deleted" })
    })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })



}