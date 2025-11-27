"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const globalEventEmitter_js_1 = __importDefault(require("../../Helpers/globalEventEmitter.js"));
const auth_api_js_1 = require("../auth_api.js");
function default_1(app, pool) {
    /*
    Add a LogicState
    Type:   POST
    Route:  '/api/addLogicState'
    Body:   {
              name: 'OPEN_CLOSE',
              value: ['OPEN','CLOSE','','','','','','']
            }
    Query:  INSERT INTO "LogicState" (id, name, value) VALUES (DEFAULT,'OPEN_CLOSE',ARRAY['OPEN','CLOSE','','','','','','']);
    Event:  {
              operation: 'INSERT',
              table: 'LogicState',
              data: {
                id: 2,
                name: 'OPEN_CLOSE',
                value: [ 'OPEN', 'CLOSE', '', '', '', '', '', '' ]
              }
            }
    */
    app.post('/api/addLogicState', auth_api_js_1.isAdmin, (req, res) => {
        var queryString = `INSERT INTO "LogicState" (id, name, value) VALUES (DEFAULT,'${req.body.name}',ARRAY[${req.body.value.map(item => `'${item}'`)}])`;
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => { res.json({ result: data.rows[0], message: "LogicState inserted" }); })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
    /*
    Modify a LogicState
    Type:   POST
    Route:  '/api/modifyLogicState'
    Body:   {
              id: 2
              name: 'OPEN_CLOSED',
              value: ['OPEN','CLOSED','','','','','','']
            }
    Query:  UPDATE "LogicState" SET (name = "OPEN_CLOSED", value = ['OPEN','CLOSED','','','','','','']) WHERE id = 2;
    Event:  {
              operation: 'UPDATE',
              table: 'LogicState',
              data: {
                id: 2,
                name: 'OPEN_CLOSED',
                value: [ 'OPEN', 'CLOSED', '', '', '', '', '', '' ]
              }
            }
    Res:    200
    Err:    400
    */
    app.post('/api/modifyLogicState', auth_api_js_1.isAdmin, (req, res) => {
        var queryString = `UPDATE "LogicState" SET name='${req.body.name}', value=ARRAY[${req.body.value.map(item => `'${item}'`)}] WHERE id = ${req.body.id}`;
        //console.log(queryString)
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => { res.json({ result: data.rows[0], message: "Logic State updated" }); })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
    /*
    Delete a LogicState
    Type:   POST
    Route:  '/api/removeLogicState'
    Body:   { id: 2 }
    Query:  DELETE FROM "LogicState" WHERE "id" = 2
    Event:  {
              operation: 'DELETE',
              table: 'LogicState',
              data: {
                id: 2,
                name: 'OPEN_CLOSE',
                value: [ 'OPEN', 'CLOSE', '', '', '', '', '', '' ]
              }
            }
    Res:    200
    Err:    400
    */
    app.post('/api/removeLogicState', auth_api_js_1.isAdmin, (req, res) => {
        var queryString = `DELETE FROM "LogicState" WHERE id = ${req.body.id};`;
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => {
            res.json({ result: data.rows, message: "Record correctly removed from LogicState " });
        })
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
}
