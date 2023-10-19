import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { CategoryWPCreate } from "./model.interface";

const DOCUMENT_NAME = "CategoryWP";
const COLLECTION_NAME = "categoryWP";

interface CategoryWPDocument extends CategoryWPCreate {}

const schema = new Schema(
  {
    _id: String,
    key: String,
    name: String,
    slug: String,
    _nameSearch: { type: [String], index: true },
    description: String,
    image: String,
    shortDescription: String,
    altImage: String,
    title: String,
    topHeading: String,
    bottomHeading: String
  },
  { _id: false }
).index({
  createdAt: 1
});

export const CategoryWPRegalModel = model<CategoryWPDocument & Document>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

CategoryWPRegalModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
