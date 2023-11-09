import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { unescape } from "querystring";
import { URLSearchParams } from "url";
import { Environment } from "../../../../config";
import {
  ApiError,
  NotFoundError,
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
import { getAdminNoteText } from "../../../../helpers/formatters";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { templateRender } from "../../../../helpers/render";
import { getPriceDisplay } from "../../../../helpers/type-conversion";
import { AppCurrency } from "../../../../database/model/AppConfig";

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
      const response = await fetch(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${req.query.ref}`,
        {
          headers: {
            Authorization: `Bearer ${paypalToken}`
          }
        }
      );
      const json = await response.json();
      const paymentStatus = json.purchase_units[0].payments.captures[0].status;

      if (json.status === "COMPLETED" && paymentStatus === "COMPLETED") {
        const paymentDetails: PapPalPaymentDetails = json.purchase_units[0];
        const currencyCode = paymentDetails.amount.currency_code;
        const orderID = (paymentDetails.reference_id as string).split("-")[1];

        if (currencyCode === "USD" || currencyCode === "GBP") {
          const snap = await db.collection("orders").doc(orderID).get();

          const order = snap.data() as Order | undefined;

          if (!order) {
            throw new NotFoundError("Order not found");
          }

          const currency = currencyOptions.find(
            currency => currency.name === currencyCode
          ) as AppCurrency;
          const nairaAmount = Math.round(
            parseFloat(paymentDetails.amount.value) *
              (currency?.conversionRate as number)
          );

          const adminNotes = getAdminNoteText(
            order.adminNotes,
            currencyCode,
            order.amount
          );

          if (!order || order.amount > nairaAmount) {
            await db
              .collection("orders")
              .doc(orderID)
              .update({
                paymentStatus:
                  "PART- PAYMENT PAID - GO AHEAD (but not seen yet)",
                adminNotes,
                currency: currencyCode,
                paymentDetails: `Website: Paid  ${getPriceDisplay(
                  order.amount,
                  currency
                )} to Paypal`
              });

            await sendEmailToAddress(
              ["info@regalflowers.com.ng"],
              templateRender(
                { ...order, adminNotes, currency: currencyCode },
                "new-order"
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              "5055243"
            );
            return new SuccessResponse("Payment is successful", true).send(res);
          }

          await db
            .collection("orders")
            .doc(orderID)
            .update({
              paymentStatus: "PAID - GO AHEAD (Paypal)",
              adminNotes,
              currency: currencyCode,
              paymentDetails: `Website: Paid  ${getPriceDisplay(
                order.amount,
                currency
              )} to Paypal`
            });

          // Send email to admin and client
          await sendEmailToAddress(
            ["info@regalflowers.com.ng"],
            templateRender(
              { ...order, adminNotes, currency: currencyCode },
              "new-order"
            ),
            `New Order (${order.fullOrderId})`,
            "5055243"
          );

          await sendEmailToAddress(
            [order.client.email as string],
            templateRender(
              { ...order, adminNotes, currency: currencyCode },
              "order"
            ),
            `Thank you for your order (${order.fullOrderId})`,
            "5055243"
          );
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
