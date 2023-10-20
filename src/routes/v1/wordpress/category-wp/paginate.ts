import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import CategoryWPRepo from "../../../../database/repository/CategoryWPRepo";
import validator from "../../../../helpers/validator";

import validation from "./validation";
import { getSearchKey } from "../../../../helpers/formatters";
import { Business } from "../../../../database/model/Order";

const categoryWP = express.Router();

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
        searchValue,
        business
      } = req.query as Record<string, any> & { business: Business };

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
            : undefined,
        business
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default categoryWP;
