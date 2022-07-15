"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
function sendMessage(socket, type, data) {
    const message = { type, data };
    socket.send(JSON.stringify(message));
}
exports.sendMessage = sendMessage;
