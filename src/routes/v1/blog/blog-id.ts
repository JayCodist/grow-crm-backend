import express from "express";
import { ApiError, BadRequestError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import validator from "../../../helpers/validator";

import validation from "./validation";
import { Business } from "../../../database/model/Order";
import BlogRepo from "../../../database/repository/BlogRepo";

const blogId = express.Router();

blogId.get(
  "/:id",
  validator(validation.business, "query"),
  async (req, res) => {
    try {
      const { business } = req.query as {
        business: Business;
      };
      const response = await BlogRepo.findById(req.params.id, business);

      if (!response) {
        new BadRequestResponse("Blog not found").send(res);
        return;
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(new BadRequestError("Blog not found"), res);
    }
  }
);

export default blogId;
