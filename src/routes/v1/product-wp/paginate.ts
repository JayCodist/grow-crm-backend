import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ProductWPRepo from "../../../database/repository/ProductWPRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const productWP = express.Router();

productWP.get(
  "/paginate",
  validator(validation.paginate, "query"),
  async (req, res) => {
    try {
      const { pageNumber, pageSize, sortField, sortType, categories, tags } =
        req.query;

      const categoryArr = String(categories || "")
        .trim()
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
      const tagArr = String(tags || "")
        .trim()
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
      const categoryProps = categoryArr.length
        ? {
            categories: {
              $in: categoryArr
            }
          }
        : {};
      const tagProps = tagArr.length
        ? {
            tags: {
              $in: tagArr
            }
          }
        : {};

      const data = await ProductWPRepo.getPaginatedProducts({
        sortLogic:
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined,
        pageSize: Number(pageSize) || undefined,
        pageNumber: Number(pageNumber) || undefined,
        filter: {
          ...categoryProps,
          ...tagProps
        }
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Failed to fetch products."), res);
    }
  }
);

export default productWP;
