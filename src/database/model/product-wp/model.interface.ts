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
  "type",
  "addonSlug",
  "class",
  "designNote",
  "budgetNote",
  "inStock"
];

export const productWPProjectionMinimal = [
  "key",
  "name",
  "price",
  "images",
  "slug",
  "subtitle",
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
  addonSlug: string;
  description: string;
  longDescription: string;
  designOptions: DesignOptionsMap;
  tags: string[];
  budgetNote: string;
  designNote: string;
  relatedVIPRef: number | null;
  relatedProducts?: MinimalProductWP[];
  inStock: boolean;
}

export interface ProductWPCreate extends ProductWP {
  _nameSearch: string[];
  _categorySearch: string[];
}
