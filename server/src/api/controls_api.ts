
/*

GetAllControls returns the following object.
The scope is to group all the necessary information to describe a control for a specific Variable or SubVariable in the HMI.
The numeric values are the ids of the corresponding entities in the database.
The object is structured as follows:

{
    "Pot": {
        "Temperature.Set": {
            "id": 14,
            "name": "Temperature.Set",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "InputValue": 15,
                "Value": 17
            }
        },
        "BatteryLevel.Act": {
            "id": 2,
            "name": "BatteryLevel.Act",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Value": 3
            }
        },
        "BatteryLevel.Limit": {
            "id": 4,
            "name": "BatteryLevel.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Max": 6,
                "Min": 5
            }
        },
        "Temperature.Limit": {
            "id": 16,
            "name": "Temperature.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Min": 18,
                "Max": 19
            }
        },
        "BatteryLevel": {
            "id": 1,
            "name": "BatteryLevel",
            "um": 5,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Act": 2,
                "Limit": 4
            }
        },
        "Light": {
            "id": 10,
            "name": "Light",
            "um": null,
            "logic_state": 1,
            "comment": "",
            "fields": {
                "Command": 11,
                "Status": 12
            }
        },
        "Temperature": {
            "id": 13,
            "name": "Temperature",
            "um": 2,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Set": 14,
                "Limit": 16
            }
        }
    },
    "Toast": {
        "Test.Set": {
            "id": 21,
            "name": "Test.Set",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "InputValue": 22,
                "Value": 24
            }
        },
        "Test.Limit": {
            "id": 23,
            "name": "Test.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Min": 25,
                "Max": 26
            }
        },
        "Test": {
            "id": 20,
            "name": "Test",
            "um": 1,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Set": 21,
                "Limit": 23
            }
        }
    }
}
*/

import globalEventEmitter from '../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAuthenticated } from './auth_api.js';
import { ErrorResponse, DBDevice, DBVar, DBField, DBTag, AuthenticatedRequest, GetAllControlsRequest, GetAllControlsResponse, Control, Controls, GetAllControlsResult } from 'shared/types';

interface FieldNameToFixedIdMap {
  [fieldName: string]: number;
}

export default function (app: Application, pool: Pool) {

  app.post('/api/getAllControls', isAuthenticated, async (req: Request<GetAllControlsRequest>, res: Response<GetAllControlsResponse | ErrorResponse>) => {
    try {
      // Recupera tutti i device e i loro template (filtrati per user se non admin)
      const { user } = req as unknown as AuthenticatedRequest;

      let deviceQuery, varsQuery, fieldsQuery, tagsQuery;
      if (user.role === 'admin') {
        // Recupera tutte le variabili, i campi e le tag
        deviceQuery = `SELECT id, name, template FROM "Device"`;
        varsQuery = `SELECT * FROM "Var"`;
        fieldsQuery = `SELECT * FROM "Field"`;
        tagsQuery = `SELECT * FROM "Tag"`;
      } else {
        // Recupera tutte le variabili, i campi e le tag relative ai device dell'utente
        deviceQuery = `SELECT id, name, template FROM "Device" WHERE user_id = ${user.id}`;
        varsQuery = `SELECT * FROM "Var" WHERE template IN (SELECT DISTINCT template FROM "Device" WHERE user_id = ${user.id})`;
        fieldsQuery = `SELECT * FROM "Field" WHERE parent_type IN (SELECT DISTINCT template FROM "Device" WHERE user_id = ${user.id})`;
        tagsQuery = `SELECT * FROM "Tag" WHERE device IN (SELECT id FROM "Device" WHERE user_id = ${user.id})`;
      }
      
      const [deviceResult, varsResult, fieldsResult, tagsResult] = await Promise.all([
        pool.query(deviceQuery),
        pool.query(varsQuery),
        pool.query(fieldsQuery),
        pool.query(tagsQuery),
      ]);
      
      const devices: DBDevice[] = deviceResult.rows;
      const vars: DBVar[] = varsResult.rows;
      const fields: DBField[] = fieldsResult.rows;
      const tags: DBTag[] = tagsResult.rows;

      const result: GetAllControlsResult = {};

      // Costruisci la struttura dei controlli per ogni device
      devices.forEach((device) => {
        // Filtra le variabili associate al template del device
        const templateVars: DBVar[] = vars.filter((v) => v.template === device.template);

        // Costruisci i controlli per ogni variabile
        const deviceControls: Controls = templateVars.reduce((controls: Controls, variable) => {

          // Filtra le tag associate alla variabile
          const varTags: DBTag[] = tags.filter((tag) => tag.var === variable.id && tag.device === device.id);

          // Costruisci i controlli per ogni tag
          varTags.forEach((tag) => {
            const control: Control = {
              device: device.id,
              id: tag.id,
              name: tag.name,
              um: tag.um,
              logic_state: tag.logic_state,
              fixed_id: tag.fixed_id !== null && tag.fixed_id !== undefined ? Number(tag.fixed_id) : null,
              comment: tag.comment,
              fields: tags
                .filter((t) => t.parent_tag == tag.id)
                .reduce((acc: FieldNameToFixedIdMap, _t: DBTag) => {
                  const field = fields.find((f) => f.id == _t.type_field);
                  if (field) {
                    //passo i fixed_id come riferimento per i field, così che l'mqtt utilizza questi per riferirsi alla tag in fase di scrittura verso ESP32
                    acc[field.name] = Number(_t.fixed_id);
                  }
                  return acc;
                }, {}),
            };

            controls[control.name] = control;
          });

          return controls;
        }, {});

        result[device.name] = deviceControls;
      });
      
      res.json({ result: result, message: 'Just got all controls' });
    } catch (error: any) {
      res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
    }
  });

}