import { model, Schema } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "ProductWP";
const COLLECTION_NAME = "productwp";

export const productWPProjection = [
  "key",
  "temporaryNote",
  "name",
  "price",
  "description",
  "longDescription",
  "images",
  "slug",
  "subtitle",
  "category",
  "sku",
  "tags",
  "featured",
  "variants",
  "addonsGroups",
  "designOptions",
  "_nameSearch",
  "type"
];

interface Addon {
  name: string;
  price: number;
  image: string;
}

interface AddonGroup {
  name: string;
  image: string;
  description: string;
  addons: Addon[];
  slug: string;
}

interface ProductImage {
  alt: string;
  src: string;
  id: number;
}

interface ProductVariant {
  name: string;
  price: number;
  class: "regular" | "vip";
}

type DesignOption = "wrappedBouquet" | "inVase" | "inLargeVase" | "box";

export interface ProductWP {
  key: number;
  name: string;
  subtitle: string;
  temporaryNote: string;
  slug: string;
  category: string;
  type: "simple" | "variable";
  featured: boolean;
  sku: string;
  price: number;
  images: ProductImage[];
  variants: ProductVariant[];
  addonsGroups: AddonGroup[];
  description: string;
  longDescription: string;
  designOptions: DesignOption[];
  tags: string[];
  _nameSearch: string[];
}

const schema = new Schema({
  key: Number,
  name: String,
  _nameSearch: { type: [String], index: true },
  subtitle: String,
  temporaryNote: String,
  slug: String,
  category: String,
  type: String,
  featured: Boolean,
  sku: String,
  price: Number,
  images: [
    {
      alt: String,
      src: String,
      id: Number
    }
  ],
  variants: [
    {
      name: String,
      price: Number,
      class: String
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
  designOptions: [String],
  tags: [String],
  timeStamp: String
});

export const ProductWPModel = model<ProductWP & Document>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

ProductWPModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
