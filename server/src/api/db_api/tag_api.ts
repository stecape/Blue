import globalEventEmitter from '../../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import { ErrorResponse, DeleteTagsRequest, DeleteTagsResponse, RefreshTagsRequest, RefreshTagsResponse, DBVar, DBType, DBField } from 'shared/types';

type Graph = Record<number, number[]>

const DeleteTags = (pool: Pool, deviceIds: number[] = [], varIds: number[] = [], deviceId: number | null = null) => {
  return new Promise<void>((resolve, reject) => {
    let queryString = `DELETE FROM "Tag" WHERE 1=1`;

    // Aggiungi i filtri per i device e le variabili, se specificati
    if (deviceId) {
      queryString += ` AND device = ${deviceId}`;
    } else if (deviceIds.length > 0) {
      queryString += ` AND device IN (${deviceIds.join(',')})`;
    }
    if (varIds.length > 0) {
      queryString += ` AND var IN (${varIds.join(',')})`;
    }

    pool.query(queryString)
      .then(() => {
        console.log("Tags deleted");
        resolve();
      })
      .catch((error) => {
        console.log("Error during tags deletion", error);
        reject(error);
      });
  });
};

const _GenerateTags = (pool: Pool, varId: number, deviceId: number, name: string, type: number, typesList: DBType[], fieldsList: DBField[], parent_tag: number, fixedIdPath: number[] = []) => {

  // Filtra i campi figli per il tipo corrente
  const childFields = fieldsList.filter((field) => field.parent_type === type);

  if (!Array.isArray(childFields) || childFields.length === 0) {
    console.error("No child fields found or fieldsList is not an array for type:", type);
    return;
  }

  childFields.forEach((f) => {
    const tagName = `${name}.${f.name}`;
    // Costruisci la path dei fixed_id (Var + Field)
    const newFixedIdPath = [...fixedIdPath, f.fixed_id];
    let fixedIdStr = newFixedIdPath.map(id => id.toString(7).padStart(2, '0')).join('');
    fixedIdStr = fixedIdStr.padEnd(18, '0');
    // Converti la stringa in base 7 in uint64 (assumiamo sempre che rientri in Number)
    let fixedIdValue = Number(BigInt(parseInt(fixedIdStr, 7)));

    const queryString = `
      INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, fixed_id, um, logic_state, comment)
      VALUES (DEFAULT, '${tagName}', ${deviceId}, ${varId}, ${parent_tag}, ${f.id},
        ${fixedIdValue},
        ${f.um !== undefined ? f.um : 'NULL'},
        ${f.logic_state !== undefined ? f.logic_state : 'NULL'},
        ${f.comment !== undefined ? `'${f.comment}'` : 'NULL'})
      RETURNING "id"
    `;
    console.log("Executing query:", queryString);
    pool.query(queryString)
      .then((data) => {
        const newParentTagId = data.rows[0].id;
        const _base_type = typesList.find((i) => i.id === f.type)?.base_type;
        if (!_base_type) {
          _GenerateTags(pool, varId, deviceId, tagName, f.type, typesList, fieldsList, newParentTagId, newFixedIdPath);
        }
      })
      .catch((error) => {
        console.error("Error generating tags:", error);
      });
  });
};

const GenerateTags = (pool: Pool, templateId?: number | null, typeId?: number | null, deviceId?: number | null) => {
  return new Promise<void>((resolve, reject) => {
    
    let deviceQuery: string = '';

    let deviceIds: number[] = [];
    let varsList: DBVar[] = [];
    let typesList: DBType[] = [];
    let fieldsList: DBField[] = [];

    // Determina la query per i device coinvolti
    if (deviceId) {
      deviceQuery = `SELECT id FROM "Device" WHERE id = ${deviceId}`;
    } else if (templateId) {
      deviceQuery = `SELECT DISTINCT "Device".id FROM "Device" WHERE template = ${templateId}`;
    } else if (typeId) {
      deviceQuery = `
        SELECT DISTINCT "Device".id
        FROM "Device"
        INNER JOIN "Var" ON "Device".template = "Var".template
        WHERE "Var".type IN (
          SELECT DISTINCT "Type".id
          FROM "Type"
          WHERE "Type".id IN (${[...DFS(buildDependencyGraph(fieldsList), typeId)].join(',')})
        )`;
    } else {
      deviceQuery = `SELECT DISTINCT "Device".id FROM "Device"`;
    }

    pool.query(deviceQuery)
      .then((deviceData) => {
        deviceIds = deviceData.rows.map((row) => row.id);

        // Recupera tutte le variabili, i tipi e i campi
        const varsQuery = `SELECT * FROM "Var"`;
        const typesQuery = `SELECT * FROM "Type"`;
        const fieldsQuery = `SELECT * FROM "Field"`;

        return Promise.all([
          pool.query(varsQuery),
          pool.query(typesQuery),
          pool.query(fieldsQuery),
        ]);
      })
      .then(([varsData, typesData, fieldsData]) => {
        varsList = varsData.rows;
        typesList = typesData.rows;
        fieldsList = fieldsData.rows;

        // Se è specificato un typeId, calcola tutte le dipendenze del tipo
        let dependentTypeIds = new Set();
        if (typeId) {
          const graph = buildDependencyGraph(fieldsList);
          dependentTypeIds = DFS(graph, typeId);
        }

        // Filtra le variabili in base al template o alle dipendenze del tipo
        const filteredVars = varsList.filter((v) => {
          if (templateId) return v.template === templateId; // Filtra per template
          if (typeId) return dependentTypeIds.has(v.type); // Filtra per dipendenze del tipo
          return true; // Nessun filtro
        });

        const varIds = filteredVars.map((v) => v.id);

        // Elimina le tag coinvolte
        return DeleteTags(pool, deviceIds, varIds, deviceId ).then(() => ({
          deviceIds,
          filteredVars,
        }));
      })
      .then(({ deviceIds, filteredVars }) => {
        // Rigenera le tag per i device e le variabili filtrate
        const promises = deviceIds.map((currentDeviceId) => {
          return filteredVars.map((v) => {
            // Genera il fixed_id gerarchico iniziale (Var)
            let fixedIdStr = v.fixed_id.toString(7).padStart(2, '0').padEnd(22, '0');
            let fixedIdValue = BigInt(parseInt(fixedIdStr, 7));

            // Inserisce la prima tag associata alla variabile
            const insertQuery = `INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, um, logic_state, comment, fixed_id) VALUES (DEFAULT, '${v.name}', ${currentDeviceId}, ${v.id}, NULL, NULL, ${v.um !== undefined ? v.um : 'NULL'}, ${v.logic_state !== undefined ? v.logic_state : 'NULL'}, ${v.comment !== undefined ? `'${v.comment}'` : 'NULL'}, ${fixedIdValue}) RETURNING "id"`;
            return pool.query(insertQuery)
              .then((insertData) => {
                const parentTagId: number = insertData.rows[0].id;
                const _base_type: boolean | undefined = typesList.find(i => i.id === v.type)?.base_type;
                if (!_base_type) {
                  _GenerateTags(pool, v.id, currentDeviceId, v.name, v.type, typesList, fieldsList, parentTagId, [v.fixed_id]);
                }
              });
          });
        });

        return Promise.all(promises.flat());
      })
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

// Funzione per costruire il grafo delle dipendenze
const buildDependencyGraph = (fieldsList: DBField[]) => {
  const graph: Graph = {};
  fieldsList.forEach((field) => {
    const type: number = field.type;
    const parentType: number = field.parent_type;
    if (!graph[parentType]) graph[parentType] = [];
    graph[parentType].push(type);
  });
  return graph;
};

// Algoritmo DFS per calcolare tutte le dipendenze di un tipo
const DFS = (graph: Graph, typeId: number, visited = new Set<number>()) => {
  if (visited.has(typeId)) return visited;
  visited.add(typeId);
  (graph[typeId] || []).forEach((childType) => DFS(graph, childType, visited));
  return visited;
};

export default function (app: Application, pool: Pool) {


  /**
   * Elimina tag dal database in base a device, variabili o deviceId
   * @route POST /api/deleteTags
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number[]} [req.body.deviceIds] - Array di ID device da cui eliminare le tag
   * @param {number[]} [req.body.varIds] - Array di ID variabili da cui eliminare le tag
   * @param {number} [req.body.deviceId] - ID device singolo
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma dell'eliminazione
   */
  app.post('/api/deleteTags', isAdmin, (req: Request<DeleteTagsRequest>, res: Response<DeleteTagsResponse | ErrorResponse>) => {
    const { deviceIds = [], varIds = [], deviceId = null } = req.body;
    DeleteTags(pool, deviceIds, varIds, deviceId )
      .then(data => res.json({ result: data, message: "Query executed, tags deleted" }))
      .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });


  /**
   * Rigenera tutte le tag per i device/variabili specificati (refresh)
   * @route POST /api/refreshTags
   * @access Admin
   * @param {Object} req - La richiesta HTTP
   * @param {Object} req.body - Il corpo della richiesta
   * @param {number} [req.body.templateId] - ID template (opzionale)
   * @param {number} [req.body.typeId] - ID tipo (opzionale)
   * @param {number} [req.body.deviceId] - ID device (opzionale)
   * @param {Object} res - La risposta HTTP
   * @returns {Object} Messaggio di conferma del refresh
   */
  app.post('/api/refreshTags', isAdmin, (req: Request<RefreshTagsRequest>, res: Response<RefreshTagsResponse | ErrorResponse>) => {
    const { templateId = null, typeId = null, deviceId = null } = req.body;

    GenerateTags(pool, templateId, typeId, deviceId )
      .then(() => {
        res.json({ message: "Tags refreshed successfully" });
      })
      .catch((error) => {
        console.error(error);
        if (!res.headersSent) {
          res.status(400).json({ code: error.code, detail: error.detail, message: error.message });
        }
      });
  });

  globalEventEmitter.on('refreshTags', (data) => {
    GenerateTags(pool, data)
      .then(() => {
        console.log("Tags refreshed successfully via event");
      })
      .catch((error) => {
        console.error("Error refreshing tags via event:", error);
      });
  });
}