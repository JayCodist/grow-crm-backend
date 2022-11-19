import dayjs from "dayjs";
import express from "express";
import fetch, { Response } from "node-fetch";
import { wCAuthString } from "../../../config";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import { CategoryWPModel } from "../../../database/model/CategoryWP";
import {
  DesignOption,
  DesignOptionsMap,
  ProductVariant,
  ProductWPCreate,
  ProductWPModel
} from "../../../database/model/ProductWP";
import AppConfigRepo from "../../../database/repository/AppConfigRepo";
import { getSearchArray } from "../../../helpers/search-helpers";
import validator from "../../../helpers/validator";
import validation from "./validation";

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
  const conversionMap: Record<string, DesignOption> = {
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
    (map: Record<string, string>, option) =>
      conversionMap[option]
        ? ({
            ...map,
            [conversionMap[option]]:
              option === defaultAttribute ? "default" : "option"
          } as DesignOptionsMap)
        : map,
    {}
  );
  return designOptionsMap;
};

const getVariants: (
  productVariations: any[],
  vipVariations: any[]
) => ProductVariant[] = (productVariations, vipVariations) => {
  const regularVariants: ProductVariant[] = productVariations.map(variation => {
    const variantName: string = variation.attributes?.find(
      (attr: { name: string }) => attr?.name === "Select Size"
    )?.option;
    return {
      class: "regular",
      sku: variation.sku,
      price: Number(variation.sale_price || variation.price) || 0,
      name:
        variantName
          ?.replace(/-/g, " ")
          .replace(/^./, char => char.toUpperCase()) || "N/A"
    };
  });

  const vipVariants: ProductVariant[] = vipVariations.map(variation => {
    const variantName: string = variation.attributes?.find(
      (attr: { name: string }) => attr?.name === "Select Size"
    )?.option;
    return {
      class: "vip",
      sku: variation.sku,
      price: Number(variation.sale_price || variation.price) || 0,
      name:
        variantName
          ?.replace(/-/g, " ")
          .replace(/^./, char => char.toUpperCase()) || "N/A"
    };
  });

  return [...regularVariants, ...vipVariants];
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
        const product: ProductWPCreate = {
          key: rawProd.id,
          name: rawProd.title.split("-")[0].trim(),
          _nameSearch: getSearchArray(
            rawProd.title?.replace(/\.\s*.\..*$/, "").trim() || ""
          ),
          subtitle:
            rawProd.title
              .split("-")[1]
              // To remove trailing ellipsis
              ?.replace(/\.\s*.\..*$/, "")
              .trim() || "",
          slug:
            rawProd.permalink
              ?.split("/product")
              .pop()
              ?.replaceAll("/", "")
              .replace(/\?.*$/, "") || "",
          sku: rawProd.sku,
          price: Number(rawProd.sale_price || rawProd.price) || 0,
          type: rawProd.type,
          description: rawProd.longDescription,
          longDescription: rawProd.shortDescription,
          categories: rawProd.categories,
          tags: rawProd.tags,
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
          _nameSearch: getSearchArray(category.name)
        })),
        { ordered: false }
      );
      await ProductWPModel.insertMany(products, { ordered: false });

      const currentSyncTotal =
        (await AppConfigRepo.getConfig())?.wPTotalSyncs || 0;

      await AppConfigRepo.updateConfig({
        wPSyncInProgress: false,
        lastWPSyncDate: dayjs().format(),
        wPTotalSyncs: currentSyncTotal + 1
      });

      new SuccessResponse("Successfully synchronized Wordpress", null).send(
        res
      );
    } catch (e) {
      await AppConfigRepo.updateConfig({ wPSyncInProgress: false });
      ApiError.handle(e as Error, res);
    }
  }
);

export default doWordpressSync;
