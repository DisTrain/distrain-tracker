"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkMessage = void 0;
const MessageBase_1 = require("./MessageBase");
class WorkMessage extends MessageBase_1.MessageBase {
    constructor(ws, data) {
        super(ws, data);
    }
    handle() {
        console.log("Data Socket", JSON.stringify({ type: "work", data: this.data }));
        this.ws.send(JSON.stringify({ type: "work", data: this.data }));
    }
}
exports.WorkMessage = WorkMessage;
