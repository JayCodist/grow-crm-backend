import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { BlogCategory } from "./model.interface";

const DOCUMENT_NAME = "BlogCategoryFloral";
const COLLECTION_NAME = "blogCategoryFloral";

const schema = new Schema({
  name: String
}).index({
  name: "text"
});

export const CategoryFloralModel = model<Document & BlogCategory>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

CategoryFloralModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
