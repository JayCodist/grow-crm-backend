import express from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ClientAccessLogRepo from "../../../database/repository/ClientAccessLogRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const clientAccessLogList = express.Router();

const getSearchKey = (str: string) => `_${str}Search`;

clientAccessLogList.get(
  "/",
  validator(validation.pagination, "query"),
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

      const data = await ClientAccessLogRepo.getPaginatedLogs({
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
      ApiError.handle(error as Error, res);
    }
  }
);

export default clientAccessLogList;
