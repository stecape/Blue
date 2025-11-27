"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app_wsMessageBroker;
const globalEventEmitter_js_1 = __importDefault(require("../Helpers/globalEventEmitter.js")); // Import globalEventEmitter
function app_wsMessageBroker(connection) {
    // Listen for dbConnected event
    globalEventEmitter_js_1.default.on('dbConnected', () => {
        connection.emit('dbConnected');
    });
    // Listen for dbDisconnected event
    globalEventEmitter_js_1.default.on('dbDisconnected', () => {
        connection.emit('dbDisconnected');
    });
    // Listen for mqttConnected event
    globalEventEmitter_js_1.default.on('mqttConnected', () => {
        connection.emit('mqttConnected');
    });
    // Listen for mqttDisconnected event
    globalEventEmitter_js_1.default.on('mqttDisconnected', () => {
        connection.emit('mqttDisconnected');
    });
    // Listen for update event
    globalEventEmitter_js_1.default.on('update', (payload) => {
        connection.emit('update', payload);
    });
}
