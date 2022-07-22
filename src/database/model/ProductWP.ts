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
}
