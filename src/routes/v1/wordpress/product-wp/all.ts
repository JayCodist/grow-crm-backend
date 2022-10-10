import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";

const allProductWp = express.Router();

allProductWp.get("/all", async (req, res) => {
  try {
    const response = await ProductWPRepo.getAllProducts();

    new SuccessResponse("success", response).send(res);
  } catch (error) {
    ApiError.handle(new InternalError("Failed to fetch products."), res);
  }
});

export default allProductWp;
