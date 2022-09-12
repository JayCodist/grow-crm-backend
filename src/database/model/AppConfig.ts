import { Schema, model, Document } from "mongoose";

const DOCUMENT_NAME = "AppConfig";
const COLLECTION_NAME = "appConfig";

export default interface AppConfig {
  wPSyncInProgress: boolean;
  wPTotalSyncs: number;
  lastWPSyncDate: string;
}

interface AppConfigDocument extends Document {}

const schema = new Schema(
  {
    wPSyncInProgress: Boolean,
    wPTotalSyncs: Number,
    lastWPSyncDate: String
  },
  { skipVersioning: true }
).index({
  createdAt: 1
});

export const AppConfigModel = model<AppConfigDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
