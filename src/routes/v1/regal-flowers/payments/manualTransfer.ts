import express from "express";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../config";
import { InternalError } from "../../../../core/ApiError";
import {
  SuccessButCaveatResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import { Business, Order } from "../../../../database/model/Order";
import PaymentLogRepo from "../../../../database/repository/PaymentLogRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { currencyOptions } from "../../../../helpers/constants";
import {
  AppCurrency,
  AppCurrencyName
} from "../../../../database/model/AppConfig";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { templateRender } from "../../../../helpers/render";
import {
  businessEmailMap,
  businessNewOrderPathMap,
  businessOrderPathMap
} from "../../../../database/repository/utils";
import {
  handleFailedVerification,
  paymentProviderStatusMap,
  recentOrderChangesUpdate
} from "../../../../helpers/type-conversion";
import { performDeliveryDateNormalization } from "./payment-utils";

const db = firestore();

const manualTransfer = express.Router();

const bankMap: Record<AppCurrencyName, string> = {
  NGN: "GTB Bank",
  USD: "Bitcoin",
  GBP: "Natwest Bank"
};

manualTransfer.post(
  "/:id",
  validator(validation.manualTransfer, "body"),
  async (req, res) => {
    try {
      const { amount, accountName, referenceNumber, currency, business } =
        req.body as {
          amount: number;
          accountName: string;
          referenceNumber: string;
          currency: AppCurrencyName;
          business: Business;
        };

      const orderId = req.params.id as string;
      const snap = await db.collection("orders").doc(orderId).get();
      const order = snap.exists
        ? ({ id: snap.id, ...snap.data() } as Order)
        : undefined;

      if (!order) {
        throw new InternalError("The order does not exist");
      }

      const infoMessage = await performDeliveryDateNormalization(
        order,
        business
      );

      const _currency = currencyOptions.find(
        _currency => _currency.name === currency
      ) as AppCurrency;

      const paymentDetails = `Website: Paid  ${
        _currency.sign
      }${amount.toLocaleString()}  with ${accountName} to ${_currency.name} - ${
        bankMap[_currency.name]
      } ${referenceNumber}`;

      await firestore().collection("orders").doc(orderId).update({
        paymentStatus: paymentProviderStatusMap.manualTransfer,
        currency,
        paymentDetails
      });

      await recentOrderChangesUpdate(orderId, {
        name: "paymentStatus",
        old: order.paymentStatus,
        new: paymentProviderStatusMap.manualTransfer
      });

      // const recentOrderChanges = await firestore()
      //   .collection("recentOrderChanges")
      //   .where("orderid", "==", orderId)
      //   .get();

      // if (recentOrderChanges.docs[0].exists) {
      //   await recentOrderChangesDb.doc(recentOrderChanges.docs[0].id).update({
      //     type: "edit",
      //     updates: {
      //       name: "paymentStatus",
      //       old: order.paymentStatus,
      //       new: paymentStatus
      //     },
      //     timestamp: firestore.FieldValue.serverTimestamp(),
      //     time: new Date().toISOString()
      //   });
      // }

      // Send email to admin and client
      await sendEmailToAddress(
        [businessEmailMap[business]],
        templateRender(
          { ...order, paymentDetails },
          businessNewOrderPathMap[business],
          business
        ),
        `New Order (${order.fullOrderId})`,
        "5055243",
        business
      );

      await sendEmailToAddress(
        [order.client.email as string],
        templateRender({ ...order }, businessOrderPathMap[business], business),
        `Thank you for your order (${order.fullOrderId})`,
        "5055243",
        business
      );

      const environment: Environment = /test/i.test(
        process.env.PAYSTACK_SECRET_KEY || ""
      )
        ? "development"
        : "production";
      await PaymentLogRepo.createPaymentLog(
        "manualTransfer",
        bankMap[_currency.name],
        environment
      );
      return new (infoMessage ? SuccessButCaveatResponse : SuccessResponse)(
        infoMessage || "Payment is successful",
        true
      ).send(res);
    } catch (error) {
      const business = req.query.business as Business;
      const orderId = req.query.orderId as string;
      await handleFailedVerification(orderId, business, "manualTransfer");
      return new SuccessResponse("Payment is successful", true).send(res);
    }
  }
);

export default manualTransfer;
