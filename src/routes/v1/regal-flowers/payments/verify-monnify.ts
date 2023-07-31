import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { unescape } from "querystring";
import { Environment } from "../../../../config";
import {
  ApiError,
  InternalError,
  PaymentFailureError
} from "../../../../core/ApiError";
import {
  InternalErrorResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import { Order } from "../../../../database/model/Order";
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { getAdminNoteText } from "../../../../helpers/formatters";

const db = firestore();

const verifyMonnify = express.Router();

const handleMonnifyLogin: () => Promise<string> = async () => {
  try {
    const base64Pass = Buffer.from(
      unescape(
        encodeURIComponent(
          `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
        )
      )
    ).toString("base64");
    const response = await fetch(
      `${process.env.MONNIFY_BASE_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Pass}`
        }
      }
    );
    const json = await response.json();
    return json.responseBody?.accessToken;
  } catch (err) {
    console.error("Unable to login to monnify: ", err);
    throw new InternalErrorResponse("Failed monnify authorization");
  }
};

verifyMonnify.post(
  "/",
  validator(validation.verifyPaymentMonnify, "query"),
  async (req, res) => {
    try {
      const monnifyToken = await handleMonnifyLogin();
      const response = await fetch(
        `${process.env.MONNIFY_BASE_URL}/api/v2/transactions/${req.query.ref}`,
        {
          headers: {
            Authorization: `Bearer ${monnifyToken}`
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
        // TODO: confirm currency is right
        if (!order || order.amount >= json.data.amount) {
          return new InternalError(
            "Unexpected error occured. Please contact your administrator"
          );
        }

        const adminNotes = getAdminNoteText(
          order.adminNotes,
          "NGN",
          order.amount
        );
        await firestore()
          .collection("orders")
          .doc(req.query.ref as string)
          .update({
            paymentStatus: "PAID - GO AHEAD (Website - Card)",
            adminNotes
          });
        const environment: Environment = /sandbox/i.test(
          process.env.MONNIFY_BASE_URL || ""
        )
          ? "development"
          : "production";
        await PaymentLogRepo.createPaymentLog("monnify", json, environment);
        return new SuccessResponse("Payment is successful", true).send(res);
      }

      throw new PaymentFailureError(json.data.message);
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyMonnify;
