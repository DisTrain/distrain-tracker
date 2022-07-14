"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinMessage = void 0;
const MessageBase_1 = require("./MessageBase");
class JoinMessage extends MessageBase_1.MessageBase {
    /**
     *
     */
    constructor(ws, data) {
        super(ws, data);
    }
    handle() {
        this.ws.send(JSON.stringify({ type: "deviceId", data: "" }));
        console.log("A new device just joined");
    }
}
exports.JoinMessage = JoinMessage;
