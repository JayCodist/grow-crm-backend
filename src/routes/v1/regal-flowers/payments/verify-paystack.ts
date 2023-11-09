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
import { currencyOptions } from "../../../../helpers/constants";
import { AppCurrency } from "../../../../database/model/AppConfig";
import { getAdminNoteText } from "../../../../helpers/formatters";
import { templateRender } from "../../../../helpers/render";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { getPriceDisplay } from "../../../../helpers/type-conversion";

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
        const orderId = (req.query.ref as string).split("-")[1];
        const { data } = json;
        const snap = await db
          .collection("orders")
          .doc(orderId as string)
          .get();
        const order = snap.data() as Order | undefined;

        if (!order) {
          throw new InternalError(
            "Payment Verification Failed: The order does not exist"
          );
        }

        const adminNotes = getAdminNoteText(
          order.adminNotes,
          data.currency,
          order.amount
        );

        const currency = currencyOptions.find(
          currency => currency.name === data.currency
        ) as AppCurrency;

        if (data.currency === "USD") {
          const nairaAmount = Math.round(
            (parseFloat(data.amount) / 100) * currency?.conversionRate || 1
          );

          if (order.amount > nairaAmount) {
            await db
              .collection("orders")
              .doc(orderId)
              .update({
                paymentStatus:
                  "PART- PAYMENT PAID - GO AHEAD (but not seen yet)",
                adminNotes,
                currency: "USD",
                paymentDetails: `Website: Paid  ${getPriceDisplay(
                  order.amount,
                  currency
                )} to Paypal`
              });

            await sendEmailToAddress(
              ["info@regalflowers.com.ng"],
              templateRender(
                { ...order, adminNotes, currency: "USD" },
                "new-order"
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              "5055243"
            );
            return new SuccessResponse("Payment is successful", true).send(res);
          }
        } else if (data.currency === "NGN") {
          const paidAmount = data.amount / 100;

          if (order.amount > paidAmount) {
            await db
              .collection("orders")
              .doc(orderId)
              .update({
                paymentStatus:
                  "PART- PAYMENT PAID - GO AHEAD (but not seen yet)",
                adminNotes,
                currency: "NGN",
                paymentDetails: `Website: Paid  ${getPriceDisplay(
                  order.amount,
                  currency
                )} to Paypal`
              });

            await sendEmailToAddress(
              ["info@regalflowers.com.ng"],
              templateRender(
                { ...order, adminNotes, currency: "NGN" },
                "new-order"
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              "5055243"
            );

            await sendEmailToAddress(
              [order.client.email as string],
              templateRender(
                { ...order, adminNotes, currency: data.currency },
                "order"
              ),
              `Thank you for your order (${order.fullOrderId})`,
              "5055243"
            );
            return new SuccessResponse("Payment is successful", true).send(res);
          }
        }

        await firestore()
          .collection("orders")
          .doc(orderId as string)
          .update({
            paymentStatus: "PAID - GO AHEAD (Website - Card)",
            adminNotes,
            currency: data.currency,
            paymentDetails: `Website: Paid ${getPriceDisplay(
              order.amount,
              currency
            )}  to paystack`
          });

        // Send email to admin and client
        await sendEmailToAddress(
          ["info@regalflowers.com.ng"],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            "new-order"
          ),
          `New Order (${order.fullOrderId})`,
          "5055243"
        );

        await sendEmailToAddress(
          [order.client.email as string],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            "order"
          ),
          `Thank you for your order (${order.fullOrderId})`,
          "5055243"
        );

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
