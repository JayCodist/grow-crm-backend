import express from "express";
import { ApiError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import validator from "../../../helpers/validator";

import validation from "./validation";
import { Business } from "../../../database/model/Order";
import BlogRepo from "../../../database/repository/BlogRepo";

const blogSlug = express.Router();

blogSlug.get(
  "/:slug",
  validator(validation.business, "query"),
  async (req, res) => {
    try {
      const { business } = req.query as {
        business: Business;
      };
      const response = await BlogRepo.findBySlug(req.params.slug, business);

      if (!response) {
        new BadRequestResponse("Blog not found").send(res);
        return;
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default blogSlug;
