import dayjs from "dayjs";
import express from "express";
import he from "he";
import fetch, { Response } from "node-fetch";
import { wCAuthStringMap } from "../../../config";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import AppConfigRepo from "../../../database/repository/AppConfigRepo";
import { getProductSlug, slugify } from "../../../helpers/formatters";
import { getSearchArray } from "../../../helpers/search-helpers";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { getCloudLinkForImage } from "../../../helpers/storage-helpers";
import {
  DesignOption,
  DesignOptionName,
  DesignOptionsMap,
  ProductVariant,
  ProductWPCreate,
  allDesignOptions
} from "../../../database/model/product-wp/model.interface";
import { Business } from "../../../database/model/Order";
import {
  CategoryModelMap,
  ProductModelMap,
  appConfigSyncDateFieldMap,
  appConfigSyncProgressFieldMap,
  appConfigTotalSyncsFieldMap
} from "../../../database/repository/utils";

const backendUrlMap: Record<Business, string> = {
  regalFlowers: "https://www.regalflower.com/wc-api/v3",
  floralHub: "https://www.floralhub.com.ng/wc-api/v3"
};

const wordpressUrlMap: Record<Business, string> = {
  regalFlowers: "https://www.regalflower.com/wp-json/wp/v2",
  floralHub: "https://www.floralhub.com.ng/wp-json/wp/v2"
};

const doWordpressSync = express.Router();

const fetchWPContent: <T = any>(
  url: string
) => Promise<[Record<string, T[]>, Response]> = async url => {
  const response = await fetch(url);
  const json = await response.json();
  if (/^(4|5)/.test(String(response.status))) {
    throw json;
  }
  return [json, response];
};

const getDesignOptionMap: (rawProd: any) => DesignOptionsMap = (
  rawProd: any
) => {
  const conversionMap: Record<string, DesignOptionName> = {
    "Box Arrangement": "box",
    "Wrapped Bouquet": "wrappedBouquet",
    "In a Vase": "inVase",
    "In Large Vase": "inLargeVase"
  };

  const attributeOptions: string[] =
    rawProd.attributes?.find(
      (attribute: any) => attribute.name === "Select Design"
    )?.options || [];

  const defaultAttribute = attributeOptions
    .find(option => option.includes("default"))
    ?.replace(/default/i, "")
    .trim();
  const designOptionsMap = attributeOptions.reduce(
    (map: Record<string, string>, option) => {
      const optionName = option.replace(/ default/i, "");
      return conversionMap[optionName]
        ? ({
            ...map,
            [conversionMap[optionName]]:
              optionName === defaultAttribute ? "default" : "option"
          } as DesignOptionsMap)
        : map;
    },
    {}
  );
  return designOptionsMap;
};

const getTagsMap: (rawProd: any) => any = rawProd => {
  const tagsMap: Record<string, string[]> = {
    budget: ["vip", "regular"],
    flowerType: ["forever roses", "fresh flowers", "plants"],
    design: [
      "box arrangements",
      "bouquets",
      "others",
      "wrapped bouquet",
      "bouquet"
    ],
    packages: ["bundled products"],
    delivery: ["same day delivery"],
    flowerName: ["roses", "chrysanthemums", "lilies", "million stars"]
  };

  const tags = rawProd.tags.reduce(
    (map: Record<string, string[]>, tag: string) => {
      const tagKey = Object.keys(tagsMap).find(key => {
        return tagsMap[key].includes(tag.toLocaleLowerCase());
      });
      if (tagKey) {
        return {
          ...map,
          [tagKey]: [...(map[tagKey] || []), tag.toLowerCase()]
        };
      }
      return map;
    },
    {}
  );

  return tags;
};

const getVariants: (
  productVariations: any[],
  vipVariations: any[]
) => ProductVariant[] = (productVariations, vipVariations) => {
  const conversionMap: Record<string, DesignOptionName> = {
    "box-arrangement": "box",
    "wrapped-bouquet": "wrappedBouquet",
    "in-a-vase": "inVase",
    "in-large-vase": "inLargeVase"
  };

  const regularVariants: ProductVariant[] = productVariations.map(variation => {
    let variantName = null;
    let variantDesign: null | DesignOption[] = null;
    if (variation.attributes?.length > 1) {
      variantName = variation.attributes[0].option;

      const design = allDesignOptions.filter(design => {
        return conversionMap[variation.attributes[1].option] === design.name;
      });
      variantDesign = [allDesignOptions[0], ...design];
    }
    variantName = variation.attributes[0].option;

    return {
      class: /vip/i.test(variantName) ? "vip" : "regular",
      sku: variation.sku,
      price: Number(variation.sale_price || variation.price) || 0,
      name:
        variantName
          ?.replace(/-/g, " ")
          .replace(/vip/i, "VIP")
          .replace(/^./, (char: string) => char.toUpperCase())
          .replace(/2$/, "") || "N/A",
      design: variantDesign
    };
  });

  const vipVariants: ProductVariant[] = vipVariations.map(variation => {
    let variantName = null;
    let variantDesign: null | DesignOption[] = null;
    if (variation.attributes?.length > 1) {
      variantName = variation.attributes[0].option;

      const design = allDesignOptions.filter(design => {
        return conversionMap[variation.attributes[1].option] === design.name;
      });
      variantDesign = [allDesignOptions[0], ...design];
    } else {
      variantName = variation.attributes[0].option;
    }
    return {
      class: /vip/i.test(variantName) ? "vip" : "regular",
      sku: variation.sku,
      price: Number(variation.sale_price || variation.price) || 0,
      name:
        variantName
          ?.replace(/-/g, " ")
          .replace(/vip/i, "VIP")
          .replace(/^./, (char: string) => char.toUpperCase())
          .replace(/2$/, "") || "N/A",
      design: variantDesign
    };
  });

  return [...regularVariants, ...vipVariants].sort((a, b) => a.price - b.price);
};

doWordpressSync.post(
  "/",
  validator(validation.doWordPressSync, "query"),
  async (req, res) => {
    const { business, imageUpdateSlugs } = req.query as unknown as {
      business: Business;
      imageUpdateSlugs?: string;
    };
    try {
      const slugMapForDeepUpdate: Record<string, boolean> =
        imageUpdateSlugs
          ?.split(",")
          .map(slug => slug.trim())
          .filter(Boolean)
          .reduce((map, slug) => ({ ...map, [slug]: true }), {}) || {};
      const [{ product_categories: categories }] = await fetchWPContent(
        `${backendUrlMap[business]}/products/categories?${wCAuthStringMap[business]}&filter[limit]=10000`
      );

      const [{ products: productsRaw }] = await fetchWPContent(
        `${backendUrlMap[business]}/products?${wCAuthStringMap[business]}&filter[limit]=10000`
      );

      const uploadedImagesArr: string[][] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const product of productsRaw) {
        const publicUrls = [];
        const shouldSyncProductImages =
          slugMapForDeepUpdate[getProductSlug(product.permalink || "")];
        // eslint-disable-next-line no-restricted-syntax
        for (const image of product.images || []) {
          // eslint-disable-next-line no-await-in-loop
          const publicUrl = await getCloudLinkForImage(
            image.src,
            business,
            shouldSyncProductImages
          );
          publicUrls.push(publicUrl);
        }
        uploadedImagesArr.push(publicUrls);
      }

      const products = productsRaw
        .map((rawProd, productIndex) => {
          const relatedVIPRef =
            Number(
              rawProd.attributes
                ?.find((attribute: any) => attribute.name === "VIP Pricing IDS")
                ?.options?.[0]?.replace(/\D/g, "")
            ) || null;
          const prodName = he.decode(
            rawProd.title.split("-")[0].trim() || "N/A"
          );
          const product: ProductWPCreate = {
            key: rawProd.id,
            name: prodName,
            _nameSearch: getSearchArray(
              `${he.decode(rawProd.title.trim() || "N/A")}`
            ),
            _categorySearch: getSearchArray(`${rawProd.categories.join(" ")}`),
            subtitle: he.decode(
              rawProd.title
                .split("-")[1]
                // To remove trailing ellipsis
                ?.replace(/\.\s*.\..*$/, "")
                .trim() || ""
            ),
            class: /^vip/i.test(prodName) ? "vip" : "regular",
            slug: getProductSlug(rawProd.permalink || ""),
            sku: rawProd.sku,
            price: Number(rawProd.sale_price || rawProd.price) || 0,
            type: rawProd.type,
            longDescription: rawProd.description,
            description: rawProd.short_description || "",
            categories: rawProd.categories.map(slugify),
            addonSlug: rawProd.addonSlug,
            tags: getTagsMap(rawProd),
            images:
              rawProd.images?.map((image: any, imageIndex: number) => ({
                src: uploadedImagesArr[productIndex][imageIndex],
                alt: image.alt || image.title || ""
              })) || [],
            featured: rawProd.featured,
            designOptions: getDesignOptionMap(rawProd),
            temporaryNotes:
              rawProd.attributes?.find(
                (attribute: any) => attribute.name === "Info Product"
              )?.options || [],
            budgetNote:
              rawProd.attributes?.find(
                (attribute: any) => attribute.name === "Info Budget"
              )?.options?.[0] || "",
            designNote:
              rawProd.attributes?.find(
                (attribute: any) => attribute.name === "Info Design"
              )?.options?.[0] || "",
            relatedVIPRef,
            variants: getVariants(
              rawProd.variations,
              relatedVIPRef
                ? productsRaw.find(prod => prod.id === relatedVIPRef)
                    ?.variations || []
                : []
            ),
            addonsGroups: [],
            inStock: rawProd.in_stock,
            pageDescription: "",
            info1: "",
            info2: ""
          };
          return product;
        })
        .filter(({ inStock }) => inStock);
      await AppConfigRepo.updateConfig({
        [appConfigSyncProgressFieldMap[business]]: true
      });
      try {
        await Promise.all([
          ProductModelMap[business].collection.drop(),
          CategoryModelMap[business].collection.drop()
        ]);
      } catch (err) {
        console.error("Unable to drop collections: ", err);
      }

      await CategoryModelMap[business].insertMany(
        categories.map(category => ({
          ...category,
          slug: slugify(category.name),
          _nameSearch: getSearchArray(category.name),
          key: category.id,
          shortDescription: "",
          altImage: "",
          title: "",
          topHeading: "",
          bottomHeading: ""
        })),
        { ordered: false }
      );
      await ProductModelMap[business].insertMany(
        products.filter(prod => prod.price),
        { ordered: false }
      );

      const currentSyncTotal = ((await AppConfigRepo.getConfig())?.[
        appConfigTotalSyncsFieldMap[business]
      ] || 0) as number;

      await AppConfigRepo.updateConfig({
        [appConfigSyncProgressFieldMap[business]]: false,
        [appConfigSyncDateFieldMap[business]]: dayjs().format(),
        [appConfigTotalSyncsFieldMap[business]]: currentSyncTotal + 1
      });

      const productCategory = await fetchWPContent(
        `${wordpressUrlMap[business]}/product_cat?per_page=100`
      );

      const [productPage1, productPage2] = await Promise.all([
        fetchWPContent(
          `${wordpressUrlMap[business]}/product?per_page=100&page=1`
        ),
        fetchWPContent(
          `${wordpressUrlMap[business]}/product?per_page=100&page=2&offset=100`
        )
      ]);

      (productCategory[0] as unknown as any[]).forEach(
        async (category: any) => {
          const otherFields =
            business === "floralHub"
              ? {
                  heroImage: category.category_hero_image
                    ? category.category_hero_image.guid
                    : "",
                  heroDescription: category.custom_top_category_description
                }
              : {};
          await CategoryModelMap[business].updateOne(
            { key: category.id.toString() },
            {
              $set: {
                ...otherFields,
                shortDescription: category.custom_category_description,
                altImage: category.alt_text_for_images,
                title: category.title_tag,
                topHeading: category.custom_top_heading_h1,
                bottomHeading: category.custom_bottom_heading_h2
              }
            }
          );
        }
      );

      [
        ...(productPage1[0] as unknown as any[]),
        ...(productPage2[0] as unknown as any[])
      ].forEach(async (product: any) => {
        const categoryKey = product.id.toString();

        await ProductModelMap[business].updateOne(
          { key: categoryKey },
          {
            $set: {
              pageDescription: product.custom_product_description,
              info1: product.product_alert,
              info2: product.product_alert_2
            }
          }
        );
      });

      new SuccessResponse("Successfully synchronized Wordpress", []).send(res);
    } catch (e) {
      await AppConfigRepo.updateConfig({
        [appConfigSyncProgressFieldMap[business]]: false
      });
      ApiError.handle(e as Error, res);
    }
  }
);

export default doWordpressSync;
