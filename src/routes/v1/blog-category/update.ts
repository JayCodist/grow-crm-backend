import express, { Request, Response } from "express";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validation from "./validation";
import validator from "../../../helpers/validator";
import BlogCategoryRepo from "../../../database/repository/BlogCategoryRepo";
import { Business } from "../../../database/model/Order";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
const blogCategoryUpdate = express.Router();

blogCategoryUpdate.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.update, "body"),
  validator(validation.business, "query"),
  async (req: Request, res: Response) => {
    try {
      const response = await BlogCategoryRepo.update(
        {
          ...req.body,
          id: req.params.id
        },
        req.query.business as Business
      );
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);
export default blogCategoryUpdate;
