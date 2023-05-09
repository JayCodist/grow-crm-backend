import express from "express";
import { ApiError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";

const orderID = express.Router();

orderID.get("/:id", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await Promise.all([
      firestore().collection("orders").doc(req.params.id).get(),
      firestore().collection("business").get()
    ]);

    const order = response[0].data();
    const business = response[1].docs.map(doc => doc.data());

    const businessLetter = business.find(
      bus => bus.name === order?.business
    )?.letter;

    const data = {
      ...order,
      fullOrderId: `${businessLetter}${order?.deliveryZone}${order?.orderID}`,
      id: req.params.id
    };

    if (!order) {
      return new NotFoundResponse("Order not found").send(res);
    }
    return new SuccessResponse("success", data).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default orderID;
