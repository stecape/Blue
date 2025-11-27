"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = close;
const app_config_js_1 = require("./app_config.js");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
let server;
const app_ws = () => {
    //Express App creation
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use((0, express_1.json)());
    server = (0, http_1.createServer)(app);
    //socket.io WebSocket creation and running on the http server
    const io = new socket_io_1.Server(server, {
        path: '/socket.io',
        cors: {
            origin: true,
            credentials: true
        }
    });
    io.on('connect', s => {
        console.log('socket.io connection', s.id);
        s.on("error", (err) => console.log("Caught socket error: ", err));
    });
    //Start listening for http req
    server.listen(app_config_js_1.ws_port, '0.0.0.0', () => console.log('listening on http://localhost:' + app_config_js_1.ws_port + '/'));
    return { connection: io, expressApp: app };
};
function close() {
    if (server) {
        server.close(() => {
            console.log('WebSocket server closed');
        });
        server.removeAllListeners();
    }
}
exports.default = app_ws;
