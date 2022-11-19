import express from "express";
import { ApiError } from "../../../../core/ApiError";
import {
  BadRequestResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const productWPSlug = express.Router();

productWPSlug.get(
  "/:slug",
  validator(validation.slug, "params"),
  async (req, res) => {
    try {
      const response = await ProductWPRepo.findBySlug(req.params.slug);

      if (!response) {
        new BadRequestResponse("Product not found").send(res);
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default productWPSlug;
