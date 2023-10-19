import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../../database/model/Order";

const allProductWp = express.Router();

allProductWp.use(
  "/",
  validator(validation.getAll, "query"),
  async (req, res) => {
    try {
      const { business } = req.query as { business: Business };
      const response = await ProductWPRepo.getAllProducts(business);

      const data = response.data.filter(product => product.inStock);
      new SuccessResponse("success", {
        ...response,
        data
      }).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default allProductWp;
