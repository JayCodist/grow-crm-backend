import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const createOrder = express.Router();

createOrder.post(
  "/create",
  handleFormDataParsing(),
  validator(validation.create, "body"),
  async (req, res) => {
    try {
      const { firestore } = firebaseAdmin;

      const response = await firestore().collection("orders").add(req.body);

      if (!response) {
        return new NotFoundResponse("Order not created").send(res);
      }

      const createdOrder = await firestore()
        .collection("orders")
        .doc(response.id)
        .get();

      const createdOrderResponse = { ...createdOrder.data(), id: response.id };

      return new SuccessResponse("success", createdOrderResponse).send(res);
    } catch (error) {
      return ApiError.handle(new InternalError("Unable to fetch order"), res);
    }
  }
);

export default createOrder;
