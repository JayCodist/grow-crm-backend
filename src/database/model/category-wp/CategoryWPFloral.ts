import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { CategoryWPCreate } from "./model.interface";

const DOCUMENT_NAME = "CategoryWPFloral";
const COLLECTION_NAME = "categoryWPFloral";

interface CategoryWPDocument extends CategoryWPCreate {}

const schema = new Schema(
  {
    _id: String,
    key: String,
    name: String,
    slug: String,
    _nameSearch: { type: [String], index: true }
  },
  { _id: false }
).index({
  createdAt: 1
});

export const CategoryWPFloralModel = model<CategoryWPDocument & Document>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

CategoryWPFloralModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
