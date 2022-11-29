import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";

const allProductWp = express.Router();

allProductWp.use("/", async (req, res) => {
  try {
    const response = await ProductWPRepo.getAllProducts();

    new SuccessResponse("success", response).send(res);
  } catch (error) {
    ApiError.handle(error as Error, res);
  }
});

export default allProductWp;
