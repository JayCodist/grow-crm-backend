import { Schema, model, Document } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "CategoryWP";
const COLLECTION_NAME = "categoriesWP";

export const categoryWPProjection = ["key", "createdAt", "name"];

export default interface CategoryWP {
  id: string;
  name: string;
  createdAt: string;
}

export interface CategoryWPCreate extends Omit<CategoryWP, "id"> {
  _nameSearch: string[];
  createdAt: string;
}

interface CategoryWPDocument extends Document, CategoryWPCreate {}

const schema = new Schema(
  {
    _id: String,
    key: String,
    name: String,
    _nameSearch: { type: [String], index: true }
  },
  { _id: false }
).index({
  createdAt: 1
});

export const CategoryWPModel = model<CategoryWPDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

CategoryWPModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
