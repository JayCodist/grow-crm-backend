import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import CategoryWPRepo from "../../../../database/repository/CategoryWPRepo";
import validator from "../../../../helpers/validator";

import validation from "./validation";

const categoryWP = express.Router();

const getSearchKey = (str: string) => `_${str}Search`;

categoryWP.get(
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
        searchValue
      } = req.query;

      const data = await CategoryWPRepo.getPaginatedCategoryWPs({
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
            : undefined
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Failed to fetch categories."), res);
    }
  }
);

export default categoryWP;
