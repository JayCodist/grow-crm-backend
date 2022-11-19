import express, { Request, Response } from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ClientAccessLogRepo from "../../../database/repository/ClientAccessLogRepo";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validator from "../../../helpers/validator";
import validation from "./validation";

const clientAccessLogCreate = express.Router();

clientAccessLogCreate.post(
  "/",
  handleFormDataParsing(),
  validator(validation.create, "body"),
  async (req: Request, res: Response) => {
    try {
      const rawIPAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const ipAddress = rawIPAddress
        ? rawIPAddress.toString().split(",")[0]
        : "N/A";
      const response = await ClientAccessLogRepo.create({
        ...req.body,
        meta: `IP: ${ipAddress} - ${req.body.meta}`
      });
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default clientAccessLogCreate;
