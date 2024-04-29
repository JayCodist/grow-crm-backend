export const productProjection = [
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
  "type",
  "addonSlug",
  "class",
  "designNote",
  "budgetNote",
  "inStock",
  "pageDescription",
  "info1",
  "info2"
];

export const productProjectionMinimal = [
  "name",
  "price",
  "images",
  "slug",
  "subtitle",
  "variants",
  "sku",
  "class"
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
  inStock: boolean;
  costPrice?: number;
  image?: string;
}

export type DesignOptionName =
  | "wrappedBouquet"
  | "inVase"
  | "inLargeVase"
  | "box";

export interface DesignOption {
  name: DesignOptionName;
  price: number;
  title: string;
  default?: boolean;
}

export const allDesignOptions: DesignOption[] = [
  {
    name: "wrappedBouquet",
    title: "Wrapped Bouquet",
    price: 0,
    default: true
  },
  {
    name: "inVase",
    title: "In Vase",
    price: 15000,
    default: false
  },
  {
    name: "inLargeVase",
    title: "In Large Vase",
    price: 30000,
    default: false
  },
  {
    name: "box",
    title: "Box",
    price: 0,
    default: false
  }
];

export type DesignOptionsMap = Partial<
  Record<DesignOptionName, "default" | "option">
>;

export interface MinimalProduct {
  key: number;
  name: string;
  subtitle: string;
  sku: string;
  slug: string;
  price: number;
  images: ProductImage;
}

export interface Product {
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
  addonSlug: string;
  description: string;
  longDescription: string;
  designOptions: DesignOptionsMap;
  tags: string[];
  budgetNote: string;
  designNote: string;
  relatedProducts?: MinimalProduct[];
  inStock: boolean;
  pageDescription: string;
  displayNameCRM?: string;
  displayNameDelivery?: string;
  productAlert1?: string;
  productAlert2?: string;
}

export interface ProductCreate extends Product {
  _nameSearch: string[];
  _categorySearch: string[];
}
