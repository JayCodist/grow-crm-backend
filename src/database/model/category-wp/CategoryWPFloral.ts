import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { CategoryWPCreate } from "./model.interface";

const DOCUMENT_NAME = "CategoryWPFloral";
const COLLECTION_NAME = "categoryWPFloral";

interface CategoryWPDocument extends CategoryWPCreate {
  heroImage: string;
  heroDescription: string;
  topHeadingH2: string;
}

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
    bottomHeading: String,
    heroImage: String,
    heroDescription: String,
    info: String,
    topHeadingH2: String
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
