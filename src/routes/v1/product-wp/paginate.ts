import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ProductWPRepo, { tag } from "../../../database/repository/ProductWPRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const productWP = express.Router();

const getSearchKey = (str: string) => `_${str}Search`;

productWP.get(
  "/paginate",
  validator(validation.paginate, "query"),
  async (req, res) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortField,
        sortType,
        searchField,
        searchValue,
        tagValue
      } = req.query;

      const data = await ProductWPRepo.getPaginatedProducts({
        sortLogic:
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined,
        pageSize: Number(pageSize) || undefined,
        pageNumber: Number(pageNumber) || undefined,
        filter:
          searchValue && searchField
            ? {
                [getSearchKey(String(searchField))]:
                  String(searchValue).toLowerCase()
              }
            : undefined,
        tags: tagValue ? ([tagValue] as tag[]) : undefined
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Failed to fetch products."), res);
    }
  }
);

export default productWP;
