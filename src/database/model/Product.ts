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
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable";
  featured: boolean;
  sku: string;
  price: number;
  salePrice: number;
  images: ProductImage[];
  variants: ProductVariant[];
  addonsGroups: AddonGroup[];
  productDescription: string;
  title: string;
  sizes?: string[];
  designOptions?: DesignOption[];
  note?: string;
  description?: string;
  details: string;
}
