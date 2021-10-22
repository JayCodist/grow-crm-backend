import { Schema, model, Document } from "mongoose";
import Logger from "../../core/Logger";

export const DOCUMENT_NAME = "ClientAccessLog";
export const COLLECTION_NAME = "clientAccessLog";

export const clientAccessLogProjection = [
  "admin",
  "createdAt",
  "orderID",
  "client",
  "meta",
  "clientID"
];

export default interface ClientAccessLog {
  id: string;
  admin: string;
  createdAt: string;
  orderID: string;
  clientID: string;
  client: string;
  meta: string;
}

export interface ClientAccessLogCreate extends Omit<ClientAccessLog, "id"> {
  _orderIDSearch: string[];
  _adminSearch: string[];
  _createdAtSearch: string[];
  _clientSearch: string[];
  _metaSearch: string[];
}

interface ClientAccessLogDocument extends Document, ClientAccessLogCreate {}

const schema = new Schema(
  {
    admin: String,
    _adminSearch: { type: [String], index: true },
    clientID: String,
    client: String,
    _clientSearch: { type: [String], index: true },
    orderID: String,
    _orderIDSearch: { type: [String], index: true },
    createdAt: String,
    _createdAtSearch: { type: [String], index: true },
    meta: String,
    _metaSearch: { type: [String], index: true }
  },
  { skipVersioning: true }
).index({
  createdAt: 1
});

export const ClientAccessLogModel = model<ClientAccessLogDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

ClientAccessLogModel.on("index", err => {
  if (err) {
    Logger.error({ message: "ClientAccessLog index error: ", err });
  } else {
    Logger.info("ClientAccessLog indexing complete");
  }
});
