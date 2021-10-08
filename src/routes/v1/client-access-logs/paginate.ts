import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
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
        sortLogic: { [(sortField as string) || "orderID"]: sortType || "asc" },
        pageSize: Number(pageSize) || 10,
        pageNumber: Number(pageNumber) || 1,
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
      ApiError.handle(
        new InternalError("Failed to fetch. Please contact your administrator"),
        res
      );
    }
  }
);

export default clientAccessLogList;
