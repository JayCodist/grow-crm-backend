import express from "express";
import { SuccessResponse } from "../../../core/ApiResponse";
import ClientAccessLogRepo from "../../../database/repository/ClientAccessLogRepo";

const clientAccessLogList = express.Router();

clientAccessLogList.get("/", async (req, res) => {
  const data = await ClientAccessLogRepo.getPaginatedLogs({});
  new SuccessResponse("success", data).send(res);
});

export default clientAccessLogList;
