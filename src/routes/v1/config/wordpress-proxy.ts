import express from "express";
import fetch from "node-fetch";
import { wCAuthString } from "../../../config";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import Logger from "../../../core/Logger";
import validator from "../../../helpers/validator";
import validation from "./validation";

export type WPBusiness = "regalFlowers" | "floralHub";

const backendUrlMap: Record<WPBusiness, string> = {
  regalFlowers: "https://www.regalflowers.com.ng/wp-json/wc/v3",
  floralHub: "https://www.floralhub.com.ng/wp-json/wc/v3"
};

const getWPProduct = express.Router();

getWPProduct.get(
  "/",
  validator(validation.getWPProduct, "query"),
  async (req, res) => {
    try {
      const { slug, business } = req.query as unknown as {
        slug: string;
        business: "regalFlowers" | "floralHub";
      };
      const response = await fetch(
        `${backendUrlMap[business]}/products?slug=${slug}${wCAuthString}`
      );
      const json = await response.json();
      if (/^(4|5)/.test(String(response.status))) {
        throw json;
      }
      const product = json[0] || null;
      new SuccessResponse("success", product).send(res);
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

export default getWPProduct;
