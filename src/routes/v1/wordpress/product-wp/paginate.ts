import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const productWP = express.Router();

productWP.use(
  "/",
  validator(validation.paginate, "query"),
  async (req, res) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortField,
        sortType,
        categories,
        productClass,
        tags
      } = req.query;

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
      const classProps = productClass ? { class: productClass } : {};

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
          ...tagProps,
          ...classProps
        }
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default productWP;
