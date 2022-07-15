"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBase = void 0;
class MessageBase {
    constructor(ws, data) {
        this.data = data;
        this.ws = ws;
    }
}
exports.MessageBase = MessageBase;
