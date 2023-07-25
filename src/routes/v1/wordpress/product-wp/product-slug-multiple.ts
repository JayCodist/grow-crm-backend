import express from "express";
import { ApiError } from "../../../../core/ApiError";
import {
  BadRequestResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const productWPSlugMultiple = express.Router();

productWPSlugMultiple.use(
  "/",
  validator(validation.slugMultiple, "query"),
  async (req, res) => {
    try {
      const slugs = (req.query.slugs as string)
        .split(",")
        .map(slug => slug.trim().toLowerCase());
      const response = await ProductWPRepo.findBySlugs(slugs);

      const data = response.filter(product => product.inStock);

      if (!response) {
        new BadRequestResponse("Products not found").send(res);
      }
      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default productWPSlugMultiple;
