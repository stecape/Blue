
import { io, Socket } from 'socket.io-client';
import React from 'react';

const serverIp = process.env.REACT_APP_SERVER_IP || window.location.origin;
export const socket: Socket = io(serverIp, { path: '/socket.io' });
export const SocketContext = React.createContext<Socket | null>(null);
