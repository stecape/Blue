import globalEventEmitter from '../Helpers/globalEventEmitter.js'; // Import globalEventEmitter
import { Server } from "socket.io"

export default function app_wsMessageBroker(connection : Server) {
  // Listen for dbConnected event
  globalEventEmitter.on('dbConnected', () => {
    connection.emit('dbConnected');
  });

  // Listen for dbDisconnected event
  globalEventEmitter.on('dbDisconnected', () => {
    connection.emit('dbDisconnected');
  });

  // Listen for mqttConnected event
  globalEventEmitter.on('mqttConnected', () => {
    connection.emit('mqttConnected');
  });

  // Listen for mqttDisconnected event
  globalEventEmitter.on('mqttDisconnected', () => {
    connection.emit('mqttDisconnected');
  });

  // Listen for update event
  globalEventEmitter.on('update', (payload) => {
    connection.emit('update', payload)
  });
}
