import { Document, model, Schema } from "mongoose";
import Logger from "../../../core/Logger";
import { ProductWPCreate } from "./model.interface";

const DOCUMENT_NAME = "ProductWP";
const COLLECTION_NAME = "productWP";

interface ProductWPRegalDocument extends ProductWPCreate {}

const schema = new Schema({
  key: { type: Number, index: true },
  name: String,
  _nameSearch: { type: [String], index: true },
  _categorySearch: { type: [String], index: true },
  subtitle: String,
  temporaryNotes: [String],
  slug: { type: String, index: true },
  addonSlug: String,
  categories: { type: [String], index: true },
  class: { type: String, index: true },
  type: String,
  featured: Boolean,
  sku: String,
  price: Number,
  images: [
    {
      alt: String,
      src: String
    }
  ],
  variants: [
    {
      name: String,
      price: Number,
      class: String,
      sku: String,
      design: [
        {
          name: String,
          title: String,
          price: Number,
          default: Boolean
        }
      ]
    }
  ],
  addonsGroups: [
    {
      name: String,
      image: String,
      description: String,
      addons: [
        {
          name: String,
          price: Number,
          image: String
        }
      ],
      slug: String
    }
  ],
  description: String,
  longDescription: String,
  designOptions: {
    wrappedBouquet: String,
    inVase: String,
    inLargeVase: String,
    box: String
  },
  tags: {
    budget: [String],
    design: [String],
    flowerType: [String],
    packages: [String],
    delivery: [String],
    flowerName: [String]
  },
  timeStamp: String,
  designNote: String,
  budgetNote: String,
  inStock: Boolean,
  pageDescription: String
});

export const ProductWPRegalModel = model<ProductWPRegalDocument & Document>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

ProductWPRegalModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
