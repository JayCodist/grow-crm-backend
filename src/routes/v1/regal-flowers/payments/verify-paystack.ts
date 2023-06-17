import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { Environment } from "../../../../config";
import {
  ApiError,
  InternalError,
  PaymentFailureError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import { Order } from "../../../../database/model/Order";
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const db = firestore();

const verifyPaystack = express.Router();

verifyPaystack.post(
  "/",
  validator(validation.verifyPaymentPaystack, "query"),
  async (req, res) => {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${req.query.ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );
      const json = await response.json();
      if (json.status && json.data.status === "success") {
        const snap = await db
          .collection("orders")
          .doc(req.query.ref as string)
          .get();
        const order = snap.data() as Order | undefined;
        // TODO: confirm currency is rightt
        if (!order || order.amount >= json.data.amount) {
          return new InternalError(
            "Unexpected error occured. Please contact your administrator"
          );
        }
        await firestore()
          .collection("orders")
          .doc(req.query.ref as string)
          .update({
            paymentStatus: "PAID - GO AHEAD (Website - Card)"
          });
        const environment: Environment = /test/i.test(
          process.env.PAYSTACK_SECRET_KEY || ""
        )
          ? "development"
          : "production";
        await PaymentLogRepo.createPaymentLog("paystack", json, environment);
        return new SuccessResponse("Payment is successful", true).send(res);
      }

      throw new PaymentFailureError(json.data.message);
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyPaystack;
