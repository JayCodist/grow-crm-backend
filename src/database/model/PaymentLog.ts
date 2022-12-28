import { Document, model, Schema } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "PaymentLog";
const COLLECTION_NAME = "paymentLog";

export type PaymentType = "paystack" | "monnify";

export interface PaymentLog {
  id: string;
  type: PaymentType;
  createdAt: string;
  logData: any;
}

const schema = new Schema({
  type: String,
  createdAt: String,
  logData: Object
}).index({
  createdAt: 1
});

export const PaymentLogModel = model<Document & PaymentLog>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

PaymentLogModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
