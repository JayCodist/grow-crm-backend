import dayjs from "dayjs";
import { Schema, model, Document } from "mongoose";

export const DOCUMENT_NAME = "ClientAccessLog";
export const COLLECTION_NAME = "clientAccessLog";

export default interface ClientAccessLog {
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: Date;
  createdAtSearch?: string;
  orderID: string;
  client: {
    name: string;
    phone: string;
    phoneAlt: string;
    phoneAlt2: string;
    email: string;
  };
}

interface ClientAccessLogDocument extends Document, ClientAccessLog {}

const schema = new Schema(
  {
    admin: {
      firstName: String,
      lastName: String,
      email: String
    },
    client: {
      name: String,
      phone: String,
      phoneAlt: String,
      phoneAlt2: String,
      email: String
    },
    orderID: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdAtSearch: {
      type: Schema.Types.String,
      default: () => dayjs().format("dddd, D MMM YYYY")
    }
  },
  {
    versionKey: false
  }
);
// .index(
//   { title: "text", description: "text" },
//   { weights: { title: 3, description: 1 }, background: false }
// );

export const ClientAccessLogModel = model<ClientAccessLogDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
