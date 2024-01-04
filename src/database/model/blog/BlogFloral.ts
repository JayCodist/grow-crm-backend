import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import { Blog } from "./model.interface";

const DOCUMENT_NAME = "BlogFloral";
const COLLECTION_NAME = "blogsFloral";

const schema = new Schema({
  title: String,
  featuredImage: String,
  body: String,
  category: { type: [String], index: true },
  createdAt: String,
  lastUpdatedAt: String,
  readMinutes: Number,
  _blogSearch: { type: [String], index: true },
  slug: { type: String, index: true }
}).index({
  createdAt: 1
});

export const BlogFloralModel = model<Document & Blog>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

BlogFloralModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
