import { Schema, model, Document } from "mongoose";

const DOCUMENT_NAME = "AppConfig";
const COLLECTION_NAME = "appConfig";

export type AppCurrencyName = "NGN" | "GBP" | "USD";

export interface AppCurrency {
  name: AppCurrencyName;
  conversionRate: number;
  sign: string;
}

export default interface AppConfig {
  wPSyncInProgress: boolean;
  wPTotalSyncs: number;
  lastWPSyncDate: string;
  currenciesLastSyncDate: string;
  currencies: AppCurrency[];
}

interface AppConfigDocument extends Document {}

const schema = new Schema(
  {
    wPSyncInProgress: Boolean,
    wPTotalSyncs: Number,
    lastWPSyncDate: String,
    currencies: [
      {
        name: String,
        conversionRate: Number
      }
    ],
    currenciesLastSyncDate: String
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
