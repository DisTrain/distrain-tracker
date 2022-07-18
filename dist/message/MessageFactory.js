"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFactory = void 0;
const FinishMessage_1 = require("./FinishMessage");
const JoinMessage_1 = require("./JoinMessage");
class MessageFactory {
    static createMessage(ws, message, s3Client) {
        let msg = null;
        console.log(message);
        console.log("tracker received msg: ", message);
        try {
            const msgJson = JSON.parse(message);
            switch (msgJson["type"]) {
                case "join":
                    msg = new JoinMessage_1.JoinMessage(ws, msgJson["body"]);
                    break;
                case "work":
                    msg = new JoinMessage_1.JoinMessage(ws, msgJson["body"]);
                    break;
                case "finish":
                    msg = new FinishMessage_1.FinishMessage(ws, msgJson["body"], s3Client);
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
