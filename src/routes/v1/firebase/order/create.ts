import express from "express";
import { ApiError, NoDataError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";

const createOrder = express.Router();

createOrder.post("/create", handleFormDataParsing(), async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore()
      .collection("orders")
      .add({ ...req.body, timestamp: firestore.FieldValue.serverTimestamp() });

    if (!response) {
      throw new NoDataError("Order not created");
    }

    const createdOrder = await firestore()
      .collection("orders")
      .doc(response.id)
      .get();

    const createdOrderResponse = { ...createdOrder.data(), id: response.id };

    return new SuccessResponse("success", createdOrderResponse).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default createOrder;
