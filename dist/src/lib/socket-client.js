"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = getSocket;
const socket_io_client_1 = require("socket.io-client");
let socket = null;
function getSocket() {
    if (socket)
        return socket;
    socket = (0, socket_io_client_1.io)({
        path: '/socket.io',
        withCredentials: true,
    });
    return socket;
}
