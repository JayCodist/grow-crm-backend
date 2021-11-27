import { Document, model, Schema } from "mongoose";

export interface Version {
  versionCode: number;
}

interface VersionDocument extends Document, Version {}

const DOCUMENT_NAME_LBCA = "LastBreakingChangeAndroid";
const COLLECTION_NAME_LBCA = "lastBreakingChangeAndroid";

const schemaLBCA = new Schema({
  versionCode: { type: Number, index: true }
});

export const LastBreakingChangeAndroidModel = model<VersionDocument>(
  DOCUMENT_NAME_LBCA,
  schemaLBCA,
  COLLECTION_NAME_LBCA
);

const DOCUMENT_NAME_LBCI = "LastBreakingChangeIOS";
const COLLECTION_NAME_LBCI = "lastBreakingChangeIOS";

const schema = new Schema({
  versionCode: { type: Number, index: true }
});

export const LastBreakingChangeIOSModel = model<VersionDocument>(
  DOCUMENT_NAME_LBCI,
  schema,
  COLLECTION_NAME_LBCI
);

const DOCUMENT_NAME_BLVA = "BlacklistVersionAndroid";
const COLLECTION_NAME_BLVA = "blacklistVersionAndroid";

const schemaBLVA = new Schema({
  versionCode: { type: Number, index: true }
});

export const BlacklistVersionAndroidModel = model<VersionDocument>(
  DOCUMENT_NAME_BLVA,
  schemaBLVA,
  COLLECTION_NAME_BLVA
);

const DOCUMENT_NAME_BLVI = "BlacklistVersionIOS";
const COLLECTION_NAME_BLVI = "blacklistVersionIOS";

const schemaBLVI = new Schema({
  versionCode: { type: Number, index: true }
});

export const BlacklistVersionIOSModel = model<VersionDocument>(
  DOCUMENT_NAME_BLVI,
  schemaBLVI,
  COLLECTION_NAME_BLVI
);
