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

import { isAuthenticated } from './auth_api.js';

export default function (app, pool) {

  app.post('/api/getAllControls', isAuthenticated, async (req, res) => {
    try {
      // Recupera tutti i device e i loro template (filtrati per user se non admin)
      let deviceQuery;
      if (req.user.role === 'admin') {
        deviceQuery = `SELECT id, name, template FROM "Device"`;
      } else {
        deviceQuery = `SELECT id, name, template FROM "Device" WHERE user_id = ${req.user.id}`;
      }
      
      const deviceResult = await pool.query({
        text: deviceQuery,
        rowMode: 'array',
      });
      const devices = deviceResult.rows;

      // Recupera tutte le variabili, i campi e le tag
      const varsQuery = `SELECT * FROM "Var"`;
      const fieldsQuery = `SELECT * FROM "Field"`;
      const tagsQuery = `SELECT * FROM "Tag"`;

      const [varsResult, fieldsResult, tagsResult] = await Promise.all([
        pool.query({ text: varsQuery, rowMode: 'array' }),
        pool.query({ text: fieldsQuery, rowMode: 'array' }),
        pool.query({ text: tagsQuery, rowMode: 'array' }),
      ]);

      const vars = varsResult.rows;
      const fields = fieldsResult.rows;
      const tags = tagsResult.rows;

      const result = {};

      // Costruisci la struttura dei controlli per ogni device
      devices.forEach((device) => {
        const [deviceId, deviceName, templateId] = device;

        // Filtra le variabili associate al template del device
        const templateVars = vars.filter((v) => v[3] === templateId);

        // Costruisci i controlli per ogni variabile
        const deviceControls = templateVars.reduce((controls, variable) => {
          const [varId, varName] = variable;

          // Filtra le tag associate alla variabile
          const varTags = tags.filter((tag) => tag[3] === varId && tag[2] === deviceId);

          // Costruisci i controlli per ogni tag
          varTags.forEach((tag) => {
            const control = {
              device: deviceId,
              id: tag[0],
              name: tag[1],
              um: tag[6],
              logic_state: tag[7],
              fixed_id: tag[10] !== null && tag[10] !== undefined ? Number(tag[10]) : null,
              comment: tag[8],
              fields: tags
                .filter((t) => t[4] == tag[0])
                .reduce((acc, _t) => {
                  const field = fields.find((f) => f[0] == _t[5]);
                  if (field) {
                    //passo i fixed_id come riferimento per i field, così che l'mqtt utilizza questi per riferirsi alla tag in fase di scrittura verso ESP32
                    acc[field[1]] = _t[10] !== null && _t[10] !== undefined ? Number(_t[10]) : null;
                  }
                  return acc;
                }, {}),
            };

            controls[control.name] = control;
          });

          return controls;
        }, {});

        result[deviceName] = deviceControls;
      });

      globalEventEmitter.emit('gotAllControls');
      res.json({ result, message: 'Just got all controls' });
    } catch (error) {
      res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
    }
  });

}