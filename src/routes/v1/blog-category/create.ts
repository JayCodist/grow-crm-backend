import express, { Request, Response } from "express";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validator from "../../../helpers/validator";
import validation from "./validation";
import BlogCategoryRepo from "../../../database/repository/BlogCategoryRepo";
import { Business } from "../../../database/model/Order";
import { SuccessResponse } from "../../../core/ApiResponse";
import { ApiError } from "../../../core/ApiError";

const blogCategoryCreate = express.Router();

blogCategoryCreate.post(
  "/",
  handleFormDataParsing(),
  validator(validation.create, "body"),
  validator(validation.business, "query"),
  async (req: Request, res: Response) => {
    try {
      const response = await BlogCategoryRepo.create(
        req.body,
        req.query.business as Business
      );
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);
export default blogCategoryCreate;
