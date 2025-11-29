import globalEventEmitter from '../../Helpers/globalEventEmitter.js';
import { Application, Request, Response } from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../auth_api.js';
import { ErrorResponse, AddFieldRequest, AddFieldResponse, ModifyFieldRequest, ModifyFieldResponse, GetFieldsRequest, GetFieldsResponse, DBField, TempField, TypeDeps } from 'shared/types';

// Types and interfaces definition
type TypeParentPairObj = { id: number; parent_type: number };

type Graph = Record<number, number[]>;

type TypesWithoutParent = { parent_type: number };

// API implementation
export default function (app: Application, pool: Pool) {
  /*
  Add a Field
  Type:   POST
  Route:  '/api/addField'
  Body:   {
            name, type, parent_type, fixed_id, um, logic_state, comment
          }
  */
  app.post('/api/addField', isAdmin, (req: Request<AddFieldRequest>, res: Response<AddFieldResponse | ErrorResponse>) => {
    const { name, type, parent_type, fixed_id, um, logic_state, comment } = req.body;
    const queryString = `INSERT INTO "Field" (name, type, parent_type, fixed_id, um, logic_state, comment) VALUES ('${name}', ${type}, ${parent_type}, ${fixed_id}, ${um}, ${logic_state}, '${comment}') RETURNING id`;
    pool.query({ text: queryString })
      .then(data => {
        const id: number = data.rows[0].id
        res.json({ result: id, message: "Field added" })})
      .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  /*
  Modify a Field
  Type:   POST
  Route:  '/api/modifyField'
  Body:   {
            id, name, type, parent_type, fixed_id, um, logic_state, comment
          }
  */
  app.post('/api/modifyField', isAdmin, (req: Request<ModifyFieldRequest>, res: Response<ModifyFieldResponse | ErrorResponse>) => {
    const { id, name, type, parent_type, fixed_id, um, logic_state, comment } = req.body;
    const queryString = `UPDATE "Field" SET name = '${name}', type = ${type}, parent_type = ${parent_type}, fixed_id = ${fixed_id}, um = ${um}, logic_state = ${logic_state}, comment = '${comment}' WHERE id = ${id}`;
    pool.query({ text: queryString, rowMode: 'array' })
      .then(data => res.json({ result: data.rows, message: "Field updated" }))
      .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // DFS function to traverse the graph and find all dependencies
  // It uses a depth counter to keep track of the depth of the recursion
  // and a visited set to avoid cycles in the graph
  // It returns a set of all visited nodes when the depth counter reaches 0
  // The graph is represented as an adjacency list, where each node points to its dependencies
  // The graph is built from the database query results, where each row represents a dependency between two types
  // The graph is built as a dictionary, where the keys are the type IDs and the values are arrays of parent type IDs
  // The DFS function is called recursively for each parent type ID that has not been visited yet
  // The visited set is updated with each visited node, and the depth counter is decremented when returning from the recursion
  // The final result is a set of all visited nodes, which represents the dependencies tree of the given type ID

  const DFS = (graph: Graph, typeId: number, visited: Set<number> | undefined = undefined, depthCounter: number | undefined = undefined): Set<number> => {
    if (visited == undefined) {
      visited = new Set<number>();
    }
    if (depthCounter == undefined) {
      depthCounter = 0;
    }
    visited.add(typeId);
    depthCounter++;
    if (graph[typeId]) {
      graph[typeId]
        .filter((item) => !visited.has(item))
        .forEach((parent) => DFS(graph, parent, visited, depthCounter));
    }
    depthCounter--;
    if (depthCounter == 0) {
      return visited;
    }
    return visited;
  }

  const getDeps = (type: number) => {
    //This method, given a type ID, returns the dependencies tree of a type.
    return new Promise<TypeDeps>((resolve, reject) => {
      // response struct preset
      var response: TypeDeps;
      var result: TypeParentPairObj[];
      // Type name query
      var queryString = `SELECT name FROM "Type" WHERE id = ${type}`;
      pool.query({
        text: queryString,
        rowMode: 'array',
      })
        .then((name) => {
          // Filling the response struct with the main type name
          response.name = name.rows[0][0];
          // Query for the fields that depend on that type
          queryString = `SELECT * FROM "Field" WHERE parent_type = ${type}`;
          return pool.query({
            text: queryString
          });
        })
        .then((data) => {
          // Filling up the "fields" part of the response struct
          response.fields = data.rows.map((field: DBField, i: number) => {
            const f: TempField = {
              id: field.id,
              name: field.name,
              type: field.type,
              parent_type: field.parent_type,
              fixed_id: field.fixed_id,
              um: field.um,
              logic_state: field.logic_state,
              comment: field.comment,
              QRef: i,
            }
            return f
          });
          /*
          Questa query per ogni type, dato il type.id, per tutti e soli i fields di quel type, restituisce l'arrey delle coppie [type.id, field.parent_type], prese una volta sola (le coppie non si ripetono: se un type id è presente due volte in un parent type, viene considerato una volta sola. ES: type ambientContitions : {(act) temperature, (act) moisture})
          [
            { type: 1, parent_type: 5 },     { type: 1, parent_type: 6 },
            { type: 1, parent_type: 7 },     { type: 3, parent_type: 101 },
            { type: 5, parent_type: 8 },     { type: 5, parent_type: 10 },
            { type: 6, parent_type: 9 },     { type: 6, parent_type: 10 },
            { type: 7, parent_type: 8 },     { type: 7, parent_type: 9 },
            { type: 7, parent_type: 10 },    { type: 10, parent_type: 100 },
            { type: 101, parent_type: 100 }
          ]
          */
          queryString = `
          SELECT
          distinct "Type".id, "Field".parent_type
          FROM "Type"
          INNER JOIN "Field" ON "Field".type="Type".id
          ORDER by id
          `;
          return pool.query({
            text: queryString
          });
        })
        .then((data) => {
          result = data.rows as TypeParentPairObj[];
          /*
          La seguente query, dato l'insieme di tutti i parent_types nella tabella fields,
          e l'insieme di tutti i types che sono stati usati a loro volta come field in un type (types.id = fields.type),
          restituisce i valori esterni, ovvero tutti i parent_type dalla tabella "Field" che non vengono usati come field type nella tabella field.
          Restituisce in pratica tutti i tipi che non hanno un parent type, che quindi nessuno dipende da loro.
          Risultato per type = 100
          [ [ 8 ], [ 9 ], [ 100 ] ]
          */
          queryString = `
            SELECT
            distinct "Field".parent_type
            FROM "Field"
            LEFT JOIN (
              SELECT
              distinct "Type".id
              FROM "Type"
              INNER JOIN "Field" ON "Field".type="Type".id
            ) a ON a.id = "Field".parent_type
            WHERE a.id IS NULL
          `;
          return pool.query({
            text: queryString,
          });
        })
        .then((data) => {
          const highestTypes: TypesWithoutParent[] = data.rows as TypesWithoutParent[];
          // Creating the Graph of the dependencies of the types
          var graph: Graph = {};
          /*
          For each row of the previous query, popolo la struttura graph. Result contiene i risultati della prima query. graph conterrà per ogni type tutti i parent type che dipendono da lui:
            graph = {
              1: [394, 395],
              4: [591],
              394: [396],
              395: [396],
              396: [592, 593],
              591: [592, 593, 594],
              592: [594, 595],
              593: [594],
              594: [595],
              595: []
            };
          */
          highestTypes.forEach((k) => (graph[k.parent_type] = []));
          // response.deps conterrà un array con gli ID di tutti i type che dipendono da uno specifico type. Ad esempio il graph nel commento di prima, DFS con type = 395, restituirà [395 396 592 594 595 593]
          response.deps = [...(DFS(graph, type) ?? [])]; // Spread operator, DSF returns a Set, I want an array. Fallback to empty array if undefined
          resolve(response);
        })
        .catch((error) => reject(error));
    });
  };
  
  /*
  Read fields
  Type:   POST
  Route:  '/api/getFields'
  Body:   { type: 128 }
  Query:  SELECT * from "Field" where "parent_type" = 128
  Event:  -
  Res:    200,
          {
            "result": {
              "name": "_Act",
              "type": 6,
              "fields": [
                  {
                      "id": 3,
                      "name": "Value",
                      "type": 1,
                      "QRef": 0
                  }
              ],
              "deps": [
                  6,
                  9,
                  10
              ]
            },
            "message": "Record(s) from table \"Field\" returned correctly"
          }
  Err:    400
  */
  app.post('/api/getFields', isAdmin, (req: Request<GetFieldsRequest>, res: Response<GetFieldsResponse | ErrorResponse>) => {
    getDeps(req.body.type)
    .then(response => {
      res.json({result: response, message: "Record(s) from table \"Field\" returned correctly"})
    })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))    
  })

}