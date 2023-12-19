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
import { Business, Order } from "../../../../database/model/Order";
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

export const businessPaystackScret: Record<Business, string> = {
  floralHub: process.env.FLORAL_HUB_PAYSTACK_SECRET_KEY as string,
  regalFlowers: process.env.REGAL_FLOWERS_PAYSTACK_SECRET_KEY as string
};

export const businessOrderPath: Record<Business, string> = {
  floralHub: "floral-order",
  regalFlowers: "order"
};

export const businessNewOrderPath: Record<Business, string> = {
  floralHub: "new-floral-order",
  regalFlowers: "new-order"
};

export const businessEmail: Record<Business, string> = {
  floralHub: "info@floralhub.com.ng",
  regalFlowers: "info@regalflowers.com.ng"
};

export const businessTemplateId: Record<Business, string> = {
  floralHub: "5369366",
  regalFlowers: "5055243"
};

verifyPaystack.post(
  "/",
  validator(validation.verifyPaymentPaystack, "query"),
  async (req, res) => {
    try {
      const business = req.query.business as Business;
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${req.query.ref}`,
        {
          headers: {
            Authorization: `Bearer ${businessPaystackScret[business]}`
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

        const paymentDetails = `Website: Paid  ${getPriceDisplay(
          order.amount,
          currency
        )} to Paystack`;

        if (data.currency === "USD") {
          const nairaAmount = Math.round(
            (parseFloat(data.amount) / 100) * currency?.conversionRate || 1
          );

          if (order.amount > nairaAmount) {
            await db.collection("orders").doc(orderId).update({
              paymentStatus: "PART- PAYMENT PAID - GO AHEAD (but not seen yet)",
              adminNotes,
              currency: "USD",
              paymentDetails
            });

            await sendEmailToAddress(
              [businessEmail[business]],
              templateRender(
                { ...order, adminNotes, currency: "USD", paymentDetails },
                businessOrderPath[business],
                business
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              businessTemplateId[business],
              business
            );
            await sendEmailToAddress(
              [order.client.email as string],
              templateRender(
                { ...order, adminNotes, currency: data.currency },
                businessOrderPath[business],
                business
              ),
              `Thank you for your order (${order.fullOrderId})`,
              businessTemplateId[business],
              business
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
                )} to Paystack`
              });

            await sendEmailToAddress(
              [businessEmail[business]],
              templateRender(
                {
                  ...order,
                  adminNotes,
                  currency: "NGN",
                  paymentDetails
                },
                businessNewOrderPath[business],
                business
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              businessTemplateId[business],
              business
            );

            await sendEmailToAddress(
              [order.client.email as string],
              templateRender(
                { ...order, adminNotes, currency: data.currency },
                businessOrderPath[business],
                business
              ),
              `Thank you for your order (${order.fullOrderId})`,
              businessTemplateId[business],
              business
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
            paymentDetails
          });

        // Send email to admin and client
        await sendEmailToAddress(
          [businessEmail[business]],
          templateRender(
            {
              ...order,
              adminNotes,
              currency: data.currency,
              paymentDetails
            },
            businessNewOrderPath[business],
            business
          ),
          `New Order (${order.fullOrderId})`,
          businessTemplateId[business],
          business
        );

        await sendEmailToAddress(
          [order.client.email as string],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            businessOrderPath[business],
            business
          ),
          `Thank you for your order (${order.fullOrderId})`,
          businessTemplateId[business],
          business
        );

        const environment: Environment = /test/i.test(
          process.env.FLORAL_HUB_PAYSTACK_SECRET_KEY || ""
        )
          ? "development"
          : "production";
        await PaymentLogRepo.createPaymentLog("paystack", json, environment);
        return new SuccessResponse("Payment is successful", true).send(res);
      }

      throw new PaymentFailureError(json.data.message);
    } catch (err) {
      const business = req.query.business as Business;
      const orderId = (req.query.ref as string).split("-")[1];
      const snap = await db
        .collection("orders")
        .doc(orderId as string)
        .get();
      const order = snap.data() as Order | undefined;

      if (order) {
        await firestore()
          .collection("orders")
          .doc(orderId as string)
          .update({
            paymentStatus: "PAID - GO AHEAD (Website - Card)",
            adminNotes: `${order.adminNotes} (Ver Failed)`
          });

        await sendEmailToAddress(
          [businessEmail[business]],
          templateRender(
            { ...order, currency: "USD" },
            businessOrderPath[business],
            business
          ),
          `Warning a New Order Ver Failed (${order.fullOrderId})`,
          businessTemplateId[business],
          business
        );
        await sendEmailToAddress(
          [order.client.email as string],
          templateRender({ ...order }, businessOrderPath[business], business),
          `Thank you for your order (${order.fullOrderId})`,
          businessTemplateId[business],
          business
        );
      }
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyPaystack;
