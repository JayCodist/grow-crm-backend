import dayjs from "dayjs";
import express from "express";
import he from "he";
import fetch, { Response } from "node-fetch";
import { wCAuthString } from "../../../config";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import { CategoryWPModel } from "../../../database/model/CategoryWP";
import {
  DesignOptionName,
  DesignOptionsMap,
  ProductVariant,
  ProductWPCreate,
  ProductWPModel
} from "../../../database/model/ProductWP";
import AppConfigRepo from "../../../database/repository/AppConfigRepo";
import { slugify } from "../../../helpers/formatters";
import { getSearchArray } from "../../../helpers/search-helpers";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { DesignOption, allDesignOptions } from "../firebase/order/create";

export type WPBusiness = "regalFlowers" | "floralHub";

const backendUrlMap: Record<WPBusiness, string> = {
  regalFlowers: "https://www.regalflowers.com.ng/wc-api/v3",
  floralHub: "https://www.floralhub.com.ng/wc-api/v3"
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
          .replace(/^./, (char: string) => char.toUpperCase()) || "N/A",
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
          .replace(/^./, (char: string) => char.toUpperCase()) || "N/A",
      design: variantDesign
    };
  });

  return [...regularVariants, ...vipVariants].sort((a, b) => a.price - b.price);
};

doWordpressSync.post(
  "/",
  validator(validation.doWordPressSync, "query"),
  async (req, res) => {
    try {
      const { business } = req.query as unknown as {
        business: "regalFlowers" | "floralHub";
      };
      const [{ product_categories: categories }] = await fetchWPContent(
        `${backendUrlMap[business]}/products/categories?${wCAuthString}&filter[limit]=10000`
      );

      const [{ products: productsRaw }] = await fetchWPContent(
        `${backendUrlMap[business]}/products?${wCAuthString}&filter[limit]=10000`
      );

      const products = productsRaw.map(rawProd => {
        const relatedVIPRef =
          Number(
            rawProd.attributes
              ?.find((attribute: any) => attribute.name === "VIP Pricing IDS")
              ?.options?.[0]?.replace(/\D/g, "")
          ) || null;
        const prodName = he.decode(rawProd.title.split("-")[0].trim() || "N/A");
        const product: ProductWPCreate = {
          key: rawProd.id,
          name: prodName,
          _nameSearch: getSearchArray(prodName),
          subtitle: he.decode(
            rawProd.title
              .split("-")[1]
              // To remove trailing ellipsis
              ?.replace(/\.\s*.\..*$/, "")
              .trim() || ""
          ),
          class: /^vip/i.test(prodName) ? "vip" : "regular",
          slug:
            rawProd.permalink
              ?.split("/product")
              .pop()
              ?.replaceAll("/", "")
              .replace(/\?.*$/, "") || "",
          sku: rawProd.sku,
          price: Number(rawProd.sale_price || rawProd.price) || 0,
          type: rawProd.type,
          longDescription: rawProd.description,
          description: rawProd.short_description || "",
          categories: rawProd.categories.map(slugify),
          addonSlug: rawProd.addonSlug,
          tags: getTagsMap(rawProd),
          images:
            rawProd.images?.map((image: any) => ({
              src: image.src,
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
          addonsGroups: []
        };
        return product;
      });
      await AppConfigRepo.updateConfig({ wPSyncInProgress: true });
      try {
        await Promise.all([
          ProductWPModel.collection.drop(),
          CategoryWPModel.collection.drop()
        ]);
      } catch (err) {
        console.error("Unable to drop collections: ", err);
      }

      await CategoryWPModel.insertMany(
        categories.map(category => ({
          ...category,
          slug: slugify(category.name),
          _nameSearch: getSearchArray(category.name)
        })),
        { ordered: false }
      );
      await ProductWPModel.insertMany(
        products.filter(prod => prod.price),
        { ordered: false }
      );

      const currentSyncTotal =
        (await AppConfigRepo.getConfig())?.wPTotalSyncs || 0;

      await AppConfigRepo.updateConfig({
        wPSyncInProgress: false,
        lastWPSyncDate: dayjs().format(),
        wPTotalSyncs: currentSyncTotal + 1
      });

      new SuccessResponse(
        "Successfully synchronized Wordpress",
        productsRaw
      ).send(res);
    } catch (e) {
      await AppConfigRepo.updateConfig({ wPSyncInProgress: false });
      ApiError.handle(e as Error, res);
    }
  }
);

export default doWordpressSync;
