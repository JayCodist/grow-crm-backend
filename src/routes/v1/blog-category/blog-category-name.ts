import express from "express";
import { ApiError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../database/model/Order";
import BlogCategoryRepo from "../../../database/repository/BlogCategoryRepo";

const blogCategoryName = express.Router();

blogCategoryName.get(
  "/:name",
  validator(validation.business, "query"),
  async (req, res) => {
    try {
      const response = await BlogCategoryRepo.findByName(
        req.params.name,
        req.query.business as Business
      );

      if (!response) {
        new BadRequestResponse("Category not found").send(res);
        return;
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default blogCategoryName;
