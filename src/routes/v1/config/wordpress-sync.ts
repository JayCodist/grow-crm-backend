import express from "express";
import fetch, { Response } from "node-fetch";
import { wCAuthString } from "../../../config";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import Logger from "../../../core/Logger";
import { ProductWP } from "../../../database/model/ProductWP";
import validator from "../../../helpers/validator";
import validation from "./validation";

export type WPBusiness = "regalFlowers" | "floralHub";

const backendUrlMap: Record<WPBusiness, string> = {
  regalFlowers: "https://www.regalflowers.com.ng/wp-json/wc/v3",
  floralHub: "https://www.floralhub.com.ng/wp-json/wc/v3"
};

const doWordpressSync = express.Router();

const fetchWPContent: (url: string) => Promise<[Response, any]> = async url => {
  const response = await fetch(url);
  const json = await response.json();
  if (/^(4|5)/.test(String(response.status))) {
    throw json;
  }
  return [response, json];
};

const WP_PAGE_SIZE = 30;

const fetchPaginatedAPContent: (url: string) => Promise<ProductWP[]> =
  async url => {
    const [response] = await fetchWPContent(`${url}&per_page=1`);
    const total = Number(response.headers.get("x-wp-total")) || 1;
    const promiseArr = Array(Math.ceil(total / 30))
      .fill("")
      .map((_, i) => {
        return fetchWPContent(`${url}&per_page=${WP_PAGE_SIZE}&page=${i + 1}`);
      });
    const productBatches = (await Promise.all(promiseArr)).map(
      response => response[1]
    );
    return productBatches.reduce(
      (products, batch) => [...products, ...batch],
      []
    );
  };

doWordpressSync.post(
  "/",
  validator(validation.doWordPressSync, "query"),
  async (req, res) => {
    try {
      const { business } = req.query as unknown as {
        business: "regalFlowers" | "floralHub";
      };
      const products = await fetchPaginatedAPContent(
        `${backendUrlMap[business]}/products?${wCAuthString}`
      );
      Logger.debug(products.length, products[0]);
      new SuccessResponse("success", products).send(res);
    } catch (e) {
      Logger.error("Failed to fetch product", e);
      ApiError.handle(
        new InternalError(
          "Failed to fetch product. Please contact your administrator"
        ),
        res
      );
    }
  }
);

export default doWordpressSync;
