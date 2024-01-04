import express, { Request, Response } from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import BlogRepo from "../../../database/repository/BlogRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../database/model/Order";

const blogDelete = express.Router();

blogDelete.delete(
  "/:id",
  validator(validation.business, "query"),
  async (req: Request, res: Response) => {
    try {
      const response = await BlogRepo.delete(
        req.params.id,
        req.query.business as Business
      );
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default blogDelete;
