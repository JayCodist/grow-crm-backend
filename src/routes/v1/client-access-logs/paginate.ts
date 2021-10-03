import express from "express";
import { SuccessResponse } from "../../../core/ApiResponse";
import ClientAccessLogRepo from "../../../database/repository/ClientAccessLogRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const clientAccessLogList = express.Router();

clientAccessLogList.get(
  "/",
  validator(validation.pagination, "query"),
  async (req, res) => {
    const { pageNumber, pageSize, sortField, sortType } = req.query;
    const data = await ClientAccessLogRepo.getPaginatedLogs({
      sortLogic: { [(sortField as string) || "orderID"]: sortType || "asc" },
      pageSize: Number(pageSize) || 10,
      pageNumber: Number(pageNumber) || 1
    });
    new SuccessResponse("success", data).send(res);
  }
);

export default clientAccessLogList;
