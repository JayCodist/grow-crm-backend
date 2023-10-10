import { Schema, model, Document } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "CategoryWP";
const COLLECTION_NAME = "categoryWP";

export const categoryWPProjection = [
  "key",
  "createdAt",
  "name",
  "slug",
  "description",
  "image"
];

export default interface CategoryWP {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  description: string;
  image: string;
}

export interface CategoryWPCreate extends Omit<CategoryWP, "id"> {
  _nameSearch: string[];
}

interface CategoryWPDocument extends Document, CategoryWPCreate {}

const schema = new Schema(
  {
    _id: String,
    key: String,
    name: String,
    slug: String,
    _nameSearch: { type: [String], index: true },
    description: String,
    image: String
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
