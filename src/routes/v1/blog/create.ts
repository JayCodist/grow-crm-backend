import express, { Request, Response } from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import BlogRepo from "../../../database/repository/BlogRepo";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../database/model/Order";

const blogCreate = express.Router();

blogCreate.post(
  "/",
  handleFormDataParsing(),
  validator(validation.create, "body"),
  validator(validation.business, "query"),
  async (req: Request, res: Response) => {
    try {
      const response = await BlogRepo.create(
        req.body,
        req.query.business as Business
      );
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default blogCreate;
