"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFactory = void 0;
const JoinMessage_1 = require("./JoinMessage");
class MessageFactory {
    static createMessage(ws, message) {
        let msg = null;
        console.log(message);
        try {
            const msgJson = JSON.parse(message);
            switch (msgJson["type"]) {
                case "join":
                    msg = new JoinMessage_1.JoinMessage(ws, msgJson["body"]);
                    break;
                case "work":
                    msg = new JoinMessage_1.JoinMessage(ws, msgJson["body"]);
                    break;
                default:
                    break;
            }
        }
        catch (_a) {
            console.error("Error occured in parsing");
        }
        return msg;
    }
}
exports.MessageFactory = MessageFactory;
