import { Schema, model, Document } from "mongoose";
import Logger from "../../core/Logger";
import { Business } from "./Order";

const DOCUMENT_NAME = "Subscriber";
const COLLECTION_NAME = "subscriber";

export const subscriberProjection = ["email", "business"];

export default interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  business: Business;
}

export interface SubscriberCreate extends Omit<Subscriber, "id"> {}

interface SubscriberDocument extends Document, SubscriberCreate {}

const schema = new Schema(
  {
    email: String,
    business: { type: String, index: true },
    createdAt: String
  },
  { skipVersioning: true }
).index({
  createdAt: 1
});

export const SubscriberModel = model<SubscriberDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

SubscriberModel.on("index", err => {
  if (err) {
    Logger.error({ message: "Subscriber index error: ", err });
  }
});
