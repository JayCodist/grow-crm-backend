import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";

const updateOrder = express.Router();

updateOrder.put("/update/:id", handleFormDataParsing(), async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore()
      .collection("orders")
      .doc(req.params.id)
      .update(req.body);

    if (!response) {
      return new NotFoundResponse("Order not found").send(res);
    }

    const updatedOrder = await firestore()
      .collection("orders")
      .doc(req.params.id)
      .get();

    const updatedOrderResponse = {
      ...updatedOrder.data(),
      id: req.params.id
    };

    return new SuccessResponse("success", updatedOrderResponse).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default updateOrder;
