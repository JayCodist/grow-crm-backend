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
  SuccessButCaveatResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import { Business, Order } from "../../../../database/model/Order";
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { getAdminNoteText } from "../../../../helpers/formatters";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { templateRender } from "../../../../helpers/render";
import { performDeliveryDateNormalization } from "./payment-utils";

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
      const business = req.query.business as Business;
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
        const order = snap.exists
          ? ({ id: snap.id, ...snap.data() } as Order)
          : undefined;
        // TODO: confirm currency is right
        if (!order || order.amount > json.data.amount) {
          return new InternalError(
            "Unexpected error occured. Please contact your administrator"
          );
        }
        const infoMessage = await performDeliveryDateNormalization(
          order,
          business
        );

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

        // Send email to admin and client
        await sendEmailToAddress(
          ["info@regalflowers.com.ng"],
          templateRender({ ...order, adminNotes }, "new-order", business),
          `New Order (${order.fullOrderId})`,
          "5055243"
        );

        await sendEmailToAddress(
          [order.client.email as string],
          templateRender({ ...order, adminNotes }, "order", business),
          `Thank you for your order (${order.fullOrderId})`,
          "5055243"
        );

        const environment: Environment = /sandbox/i.test(
          process.env.MONNIFY_BASE_URL || ""
        )
          ? "development"
          : "production";
        await PaymentLogRepo.createPaymentLog("monnify", json, environment);
        return new (infoMessage ? SuccessButCaveatResponse : SuccessResponse)(
          infoMessage || "Payment is successful",
          true
        ).send(res);
      }

      throw new PaymentFailureError(json.responseMessage);
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyMonnify;
