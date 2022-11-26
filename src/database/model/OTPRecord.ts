import { Document, model, Schema } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "OTPRecord";
const COLLECTION_NAME = "OTPRecords";

export interface OTPRecord {
  id: string;
  code: string;
  email: string;
  createdAt: string;
}

const schema = new Schema({
  code: String,
  email: String,
  createdAt: String
}).index({
  createdAt: 1
});

export const OTPRecordModel = model<Document & OTPRecord>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

OTPRecordModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
