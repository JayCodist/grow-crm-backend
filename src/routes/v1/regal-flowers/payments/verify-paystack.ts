import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { Environment } from "../../../../config";
import { InternalError, PaymentFailureError } from "../../../../core/ApiError";
import {
  SuccessButCaveatResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import { Business, Order } from "../../../../database/model/Order";
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { currencyOptions } from "../../../../helpers/constants";
import { AppCurrency } from "../../../../database/model/AppConfig";
import { getAdminNoteText } from "../../../../helpers/formatters";
import { getPriceDisplay, templateRender } from "../../../../helpers/render";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import {
  businessEmailMap,
  businessNewOrderPathMap,
  businessOrderPathMap,
  businessPaystackScret,
  businessTemplateIdMap
} from "../../../../database/repository/utils";
import { handleFailedVerification } from "../../../../helpers/type-conversion";
import { performDeliveryDateNormalization } from "./payment-utils";

const db = firestore();

const verifyPaystack = express.Router();

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
        const order = snap.exists
          ? ({ id: snap.id, ...snap.data() } as Order)
          : undefined;

        if (!order) {
          throw new InternalError(
            "Payment Verification Failed: The order does not exist"
          );
        }

        const infoMessage = await performDeliveryDateNormalization(
          order,
          business
        );

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
              [businessEmailMap[business]],
              templateRender(
                { ...order, adminNotes, currency: "USD", paymentDetails },
                businessOrderPathMap[business],
                business
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              businessTemplateIdMap[business],
              business
            );
            await sendEmailToAddress(
              [order.client.email as string],
              templateRender(
                { ...order, adminNotes, currency: data.currency },
                businessOrderPathMap[business],
                business
              ),
              `Thank you for your order (${order.fullOrderId})`,
              businessTemplateIdMap[business],
              business
            );
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
              [businessEmailMap[business]],
              templateRender(
                {
                  ...order,
                  adminNotes,
                  currency: "NGN",
                  paymentDetails
                },
                businessNewOrderPathMap[business],
                business
              ),
              `Warning a New Order amount mismatch (${order.fullOrderId})`,
              businessTemplateIdMap[business],
              business
            );

            await sendEmailToAddress(
              [order.client.email as string],
              templateRender(
                { ...order, adminNotes, currency: data.currency },
                businessOrderPathMap[business],
                business
              ),
              `Thank you for your order (${order.fullOrderId})`,
              businessTemplateIdMap[business],
              business
            );
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
          [businessEmailMap[business]],
          templateRender(
            {
              ...order,
              adminNotes,
              currency: data.currency,
              paymentDetails
            },
            businessNewOrderPathMap[business],
            business
          ),
          `New Order (${order.fullOrderId})`,
          businessTemplateIdMap[business],
          business
        );

        await sendEmailToAddress(
          [order.client.email as string],
          templateRender(
            { ...order, adminNotes, currency: data.currency },
            businessOrderPathMap[business],
            business
          ),
          `Thank you for your order (${order.fullOrderId})`,
          businessTemplateIdMap[business],
          business
        );

        const environment: Environment = /test/i.test(
          process.env.FLORAL_HUB_PAYSTACK_SECRET_KEY || ""
        )
          ? "development"
          : "production";
        await PaymentLogRepo.createPaymentLog("paystack", json, environment);
        return new (infoMessage ? SuccessButCaveatResponse : SuccessResponse)(
          infoMessage || "Payment is successful",
          true
        ).send(res);
      }

      throw new PaymentFailureError(json.data.message);
    } catch (err) {
      const business = req.query.business as Business;
      const orderId = (req.query.ref as string).split("-")[1];
      await handleFailedVerification(orderId, business, "paystack");
      return new SuccessResponse("Payment is successful", true).send(res);
    }
  }
);

export default verifyPaystack;
