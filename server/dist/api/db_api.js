"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const globalEventEmitter_js_1 = __importDefault(require("../Helpers/globalEventEmitter.js"));
const auth_api_js_1 = require("./auth_api.js");
const device_api_js_1 = __importDefault(require("./db_api/device_api.js"));
const field_api_js_1 = __importDefault(require("./db_api/field_api.js"));
const logic_state_api_js_1 = __importDefault(require("./db_api/logic_state_api.js"));
const tag_api_js_1 = __importDefault(require("./db_api/tag_api.js"));
const template_api_js_1 = __importDefault(require("./db_api/template_api.js"));
const type_api_js_1 = __importDefault(require("./db_api/type_api.js"));
const um_api_js_1 = __importDefault(require("./db_api/um_api.js"));
const var_api_js_1 = __importDefault(require("./db_api/var_api.js"));
const user_api_js_1 = __importDefault(require("./db_api/user_api.js"));
function default_1(app, pool) {
    (0, device_api_js_1.default)(app, pool);
    (0, field_api_js_1.default)(app, pool);
    (0, logic_state_api_js_1.default)(app, pool);
    (0, tag_api_js_1.default)(app, pool);
    (0, template_api_js_1.default)(app, pool);
    (0, type_api_js_1.default)(app, pool);
    (0, um_api_js_1.default)(app, pool);
    (0, var_api_js_1.default)(app, pool);
    (0, user_api_js_1.default)(app, pool);
    /*
    Execute a query (solo admin)
    Type:   POST
    Route:  '/api/exec'
    Body:   {
              query: 'INSERT INTO "Var" ("id","name","type") VALUES (DEFAULT,'Temperature 2','1')'
            }
    Query:  INSERT INTO "Var" ("id","name","type") VALUES (DEFAULT,'Temperature 2','1')
    Event:  {
              operation: 'INSERT',
              table: 'Var',
              data: { id: 133, type: 1, name: 'Temperature 2' }
            }
    Res:    200
    Err:    400
    */
    app.post('/api/exec', auth_api_js_1.isAdmin, (req, res) => {
        var queryString = req.body.query;
        console.log(queryString);
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => res.json({ result: data, message: "Query executed" }))
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
    /*
    Get all records (autenticato - admin vede tutto, user filtrato)
    Type:   POST
    Route:  '/api/getAll'
    Body:   {
              table: 'Var',
              fields: [ 'name', 'type', 'id' ]
            }
    Query:  SELECT "name","type","id" from "Var"
    Event:  -
    Res:    200,
            {
              value: [
                [ 'Temperature 1', 1, 131 ],
                [ 'Temperature 2', 1, 124 ],
                [ 'Temperature 3', 3, 125 ]
              ]
            }
    Err:    400
    */
    app.post('/api/getAll', auth_api_js_1.isAuthenticated, (req, res) => {
        var queryString = `SELECT ${req.body.fields.join(',')} FROM "${req.body.table}" ORDER BY id ASC`;
        //console.log(queryString)
        pool.query({
            text: queryString,
            rowMode: 'array'
        })
            .then(data => res.json({ result: data.rows, message: data.rowCount + " record(s) from table \"" + req.body.table + "\" returned correctly" }))
            .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
    });
}
