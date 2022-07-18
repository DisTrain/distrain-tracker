import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import AWS from "aws-sdk";
import { WebSocket } from "ws";
import { MessageBase } from "./MessageBase";
import dotenv from "dotenv";
dotenv.config();

export class FinishMessage extends MessageBase {
  private s3Client: S3Client;
  private model: any;

  constructor(ws: WebSocket, data: any, s3Client: S3Client) {
    super(ws, data);
    this.s3Client = s3Client;
    this.model = data;
  }

  handle(): void {
    console.log("Uploading final model to s3");
    console.log(this.model);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: "final_model.json",
      Body: this.model,
    };

    try {
      const data = this.s3Client.send(new PutObjectCommand(uploadParams));
      console.log("Successfully uploaded photo.");
    } catch (err: any) {
      console.log("There was an error uploading your photo");
    }
  }
}
