import express from "express";
import { ApiError } from "../../../../core/ApiError";
import {
  BadRequestResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import CategoryWPRepo from "../../../../database/repository/CategoryWPRepo";
import validator from "../../../../helpers/validator";

import validation from "./validation";
import { Business } from "../../../../database/model/Order";

const categoryWPSlug = express.Router();

categoryWPSlug.get(
  "/:slug",
  validator(validation.slug, "params"),
  async (req, res) => {
    try {
      const { slug, business } = req.params as {
        slug: string;
        business: Business;
      };
      const response = await CategoryWPRepo.findBySlug(slug, business);

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

export default categoryWPSlug;
