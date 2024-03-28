import express from "express";
import { ApiError, BadRequestError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../database/model/Order";
import BlogCategoryRepo from "../../../database/repository/BlogCategoryRepo";

const blogCategoryId = express.Router();

blogCategoryId.get(
  "/:id",
  validator(validation.business, "query"),
  async (req, res) => {
    try {
      const response = await BlogCategoryRepo.findById(
        req.params.id,
        req.query.business as Business
      );

      if (!response) {
        new BadRequestResponse("Category not found").send(res);
        return;
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(new BadRequestError("Blog not found"), res);
    }
  }
);

export default blogCategoryId;
