import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const paymentStatus = express.Router();

paymentStatus.get("/status", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await (
      await firestore().collection("paymentstatus").get()
    ).docs.map(doc => doc.data().name);

    if (!response) {
      return new NotFoundResponse("Order not found").send(res);
    }
    return new SuccessResponse("success", response).send(res);
  } catch (error) {
    return ApiError.handle(
      new InternalError("Unable to fetch payment status"),
      res
    );
  }
});

export default paymentStatus;
