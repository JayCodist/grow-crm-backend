import { Document, model, Schema } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "ProductWP";
const COLLECTION_NAME = "productWP";

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
  "categories",
  "sku",
  "tags",
  "featured",
  "variants",
  "addonsGroups",
  "designOptions",
  "type"
];

export const productWPProjectionMinimal = [
  "key",
  "name",
  "price",
  "images",
  "slug",
  "subtitle",
  "sku"
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
}

export interface ProductVariant {
  name: string;
  price: number;
  sku: string;
  class: "regular" | "vip";
}

export type DesignOption = "wrappedBouquet" | "inVase" | "inLargeVase" | "box";

export type DesignOptionsMap = Partial<
  Record<DesignOption, "default" | "option">
>;

export interface MinimalProductWP {
  key: number;
  name: string;
  subtitle: string;
  sku: string;
  slug: string;
  price: number;
  images: ProductImage;
}

export interface ProductWP {
  key: number;
  name: string;
  subtitle: string;
  temporaryNotes: string[];
  slug: string;
  categories: string[];
  type: "simple" | "variable";
  class: "regular" | "vip";
  featured: boolean;
  sku: string;
  price: number;
  images: ProductImage[];
  variants: ProductVariant[];
  addonsGroups: AddonGroup[];
  description: string;
  longDescription: string;
  designOptions: DesignOptionsMap;
  tags: string[];
  budgetNote: string;
  designNote: string;
  relatedVIPRef: number | null;
  relatedProducts?: MinimalProductWP[];
}

export interface ProductWPCreate extends ProductWP {
  _nameSearch: string[];
}

interface ProductWPDocument extends ProductWPCreate {}

const schema = new Schema({
  key: Number,
  name: String,
  _nameSearch: { type: [String], index: true },
  subtitle: String,
  temporaryNotes: [String],
  slug: { type: String, index: true },
  categories: { type: [String], index: true },
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
      sku: String
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
  tags: { type: [String], index: true },
  timeStamp: String
});

export const ProductWPModel = model<ProductWPDocument & Document>(
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
