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
import {
  getAdminNoteText,
  removeCurrency
} from "../../../../helpers/formatters";
import { templateRender } from "../../../../helpers/render";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";

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
        const orderId = removeCurrency(req.query.ref as string);
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

        if (data.currency === "USD") {
          const currency = currencyOptions.find(
            currency => currency.name === "USD"
          ) as AppCurrency;

          const nairaAmount = Math.round(
            (parseFloat(data.amount) / 100) * currency?.conversionRate || 1
          );

          if (order.amount > nairaAmount) {
            throw new InternalError(
              "Payment Verification Failed: The amount paid is less than the order's total amount."
            );
          }
        } else if (data.currency === "NGN") {
          const paidAmount = data.amount / 100;

          if (order.amount > paidAmount) {
            throw new InternalError(
              "Payment Verification Failed: The amount paid is less than the order's total amount."
            );
          }
        }

        const adminNotes = getAdminNoteText(
          order.adminNotes,
          data.currency,
          order.amount
        );

        await firestore()
          .collection("orders")
          .doc(orderId as string)
          .update({
            paymentStatus: "PAID - GO AHEAD (Website - Card)",
            adminNotes,
            currency: data.currency
          });

        // Send email to admin and client
        await sendEmailToAddress(
          ["info@regalflowers.com.ng"],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            "new-order"
          ),
          "New Order",
          "5055243"
        );

        await sendEmailToAddress(
          [order.client.email as string],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            "order"
          ),
          "Thank you for your order",
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
