import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { unescape } from "querystring";
import { URLSearchParams } from "url";
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
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { Order } from "../../../../database/model/Order";
import { currencyOptions } from "../../../../helpers/constants";

const db = firestore();

const verifyPaypal = express.Router();

const handlePaypalLogin: () => Promise<string> = async () => {
  try {
    const base64Pass = Buffer.from(
      unescape(
        encodeURIComponent(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        )
      )
    ).toString("base64");
    const response = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "client_credentials"
        }),
        headers: {
          Authorization: `Basic ${base64Pass}`
        }
      }
    );
    const json = await response.json();
    return json.access_token;
  } catch (err) {
    console.error("Unable to login to paypal: ", err);
    throw new InternalErrorResponse("Failed paypal authorization");
  }
};

interface PapPalPaymentDetails {
  reference_id: string;
  amount: {
    currency_code: "USD" | "GBP";
    value: string;
  };
}

verifyPaypal.post(
  "/",
  validator(validation.verifyPaymentPaypal, "query"),
  async (req, res) => {
    try {
      const paypalToken = await handlePaypalLogin();
      console.log(req.query.ref, paypalToken);
      const response = await fetch(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${req.query.ref}`,
        {
          headers: {
            Authorization: `Bearer ${paypalToken}`
          }
        }
      );
      const json = await response.json();
      if (
        json.status &&
        (json.status === "COMPLETED" || json.status === "APPROVED") &&
        json.purchase_units?.length
      ) {
        const paymentDetails: PapPalPaymentDetails = json.purchase_units[0];
        const currencyCode = paymentDetails.amount.currency_code;

        if (currencyCode === "USD" || currencyCode === "GBP") {
          const snap = await db
            .collection("orders")
            .doc(paymentDetails.reference_id as string)
            .get();

          const order = snap.data() as Order | undefined;

          const conversionRate = currencyOptions.find(
            currency => currency.name === currencyCode
          )?.conversionRate as number;
          const nairaAmount = Math.round(
            parseFloat(paymentDetails.amount.value) * conversionRate
          );

          if (!order || order.amount >= nairaAmount) {
            throw new InternalError(
              "Payment Verification Failed: The amount paid is less than the order's total amount."
            );
          }

          await db
            .collection("orders")
            .doc(paymentDetails.reference_id as string)
            .update({
              paymentStatus: "PAID - GO AHEAD (Website - Card)"
            });
          const environment: Environment = /sandbox/i.test(
            process.env.PAYPAL_BASE_URL || ""
          )
            ? "development"
            : "production";
          await PaymentLogRepo.createPaymentLog("paypal", json, environment);
          return new SuccessResponse("Payment is successful", true).send(res);
        }
      }
      throw new PaymentFailureError(
        json.error_description || "Invalid details"
      );
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyPaypal;
