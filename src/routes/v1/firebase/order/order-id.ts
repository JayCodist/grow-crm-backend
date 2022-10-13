import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const ordertID = express.Router();

ordertID.get("/:id", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await firestore()
      .collection("orders")
      .doc(req.params.id)
      .get();

    const data = response.data();

    const order = {
      paymentStatus: data?.paymentStatus,
      amount: data?.amount,
      orderID: data?.orderID,
      deliveryStatus: data?.deliveryStatus,
      orderItems: data?.orderProducts
    };

    if (!data) {
      return new NotFoundResponse("Order not found").send(res);
    }
    return new SuccessResponse("success", order).send(res);
  } catch (error) {
    return ApiError.handle(new InternalError("Unable to fetch order"), res);
  }
});

export default ordertID;
