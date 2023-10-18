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
  wPSyncInProgressRegal: boolean;
  wPSyncInProgressFloral: boolean;
  wPTotalSyncsRegal: number;
  wPTotalSyncsFloral: number;
  lastWPSyncDateRegal: string;
  lastWPSyncDateFloral: string;
  currenciesLastSyncDate: string;
  currencies: AppCurrency[];
}

interface AppConfigDocument extends Document {}

const schema = new Schema(
  {
    wPSyncInProgressRegal: Boolean,
    wPSyncInProgresFloral: Boolean,
    wPTotalSyncsRegal: Number,
    wPTotalSyncsFloral: Number,
    lastWPSyncDateRegal: String,
    lastWPSyncDateFloral: String,
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
