"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinishMessage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const MessageBase_1 = require("./MessageBase");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class FinishMessage extends MessageBase_1.MessageBase {
    constructor(ws, data, s3Client) {
        super(ws, data);
        this.s3Client = s3Client;
        this.model = data;
        console.log("created finish message");
    }
    handle() {
        console.log("Uploading final model to s3");
        console.log(this.model);
        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: "final_model.json",
            Body: this.model,
        };
        try {
            const data = this.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
            console.log("Successfully uploaded photo.");
        }
        catch (err) {
            console.log("There was an error uploading your photo");
        }
    }
}
exports.FinishMessage = FinishMessage;
