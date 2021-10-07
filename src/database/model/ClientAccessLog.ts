import { Schema, model, Document } from "mongoose";

export const DOCUMENT_NAME = "ClientAccessLog";
export const COLLECTION_NAME = "clientAccessLog";

export default interface ClientAccessLog {
  admin: string;
  _adminSearch: string[];
  createdAt?: string;
  _createdAtSearch?: string[];
  orderID: string;
  _orderIDSearch: string[];
  client: string;
  _clientSearch: string[];
}

interface ClientAccessLogDocument extends Document, ClientAccessLog {}

const schema = new Schema(
  {
    admin: String,
    _adminSearch: [String],
    client: String,
    _clientSearch: [String],
    orderID: String,
    _orderIDSearch: [String],
    createdAt: String,
    _createdAtSearch: [String]
  },
  {
    versionKey: false
  }
);
// .index({
//   "admin.firstName": "text",
//   client: "text",
//   orderID: "text",
//   createdAtSearch: "text"
// });

export const ClientAccessLogModel = model<ClientAccessLogDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
