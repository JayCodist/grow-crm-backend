import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { BlogCategory } from "./model.interface";

const DOCUMENT_NAME = "BlogCategoryRegal";
const COLLECTION_NAME = "blogCategoryRegal";

const schema = new Schema({
  name: String
}).index({
  name: "text"
});

export const CategoryRegalModel = model<Document & BlogCategory>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

CategoryRegalModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
