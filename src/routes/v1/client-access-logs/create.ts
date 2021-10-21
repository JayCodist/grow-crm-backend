import express, { Request, Response } from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
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
      const ipAddress = req.ip;
      const response = await ClientAccessLogRepo.create({
        ...req.body,
        meta: `IP: ${ipAddress} - ${req.body.meta}`
      });
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(
        new InternalError(
          "Unable to create client-access log. Please contact your administrator"
        ),
        res
      );
    }
  }
);

export default clientAccessLogCreate;
