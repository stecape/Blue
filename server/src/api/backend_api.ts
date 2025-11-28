import { dbConnected } from '../DB/db_manager.js';
import { mqttClient } from './mqtt_api.js';
import { isAuthenticated } from './auth_api.js';
import { Application, Request, Response } from 'express';
import { BackendStatusResult, BackendStatusResponse } from 'shared/types';

export default function (app: Application) {

  app.get('/', (req: Request, res: Response) => {
    console.log('express connection')
    res.status(200).send('<p>Express.js BackEnd Server. Ciao!</p>')
  })

  
  /*
  * Get Backend Status
  * This API returns the status of the backend
  */

  const result: BackendStatusResult = {
      dbConnected: dbConnected,
      mqttConnected: mqttClient.connected
  }

  const response: BackendStatusResponse = {
      result: result,
      message: "Backend Status retrieved"
  }

  app.post('/api/getBackendStatus', isAuthenticated, (req: Request, res: Response<BackendStatusResponse>) => {
    res.json(response)
  })

}