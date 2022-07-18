import { S3Client } from "@aws-sdk/client-s3";
import { WebSocket } from "ws";
import { FinishMessage } from "./FinishMessage";
import { JoinMessage } from "./JoinMessage";
import { MessageBase } from "./MessageBase";

export class MessageFactory {
  static createMessage(ws: WebSocket, message: string, s3Client: S3Client): MessageBase | null {
    let msg: MessageBase | null = null;
    console.log(message);
    console.log("tracker received msg: ", message);
    try {
      const msgJson = JSON.parse(message);
      switch (msgJson["type"]) {
        case "join":
          msg = new JoinMessage(ws, msgJson["body"]);
          break;
        case "work":
          msg = new JoinMessage(ws, msgJson["body"]);
          break;
        case "finish":
          msg = new FinishMessage(ws, msgJson["body"], s3Client);
        default:
          break;
      }
    } catch {
      console.error("Error occured in parsing");
    }

    return msg;
  }
}
