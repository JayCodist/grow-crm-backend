import express from "express";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../config";
import { ApiError, InternalError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import { Order } from "../../../../database/model/Order";
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
      const { amount, accountName, referenceNumber, currency } = req.body as {
        amount: number;
        accountName: string;
        referenceNumber: string;
        currency: AppCurrencyName;
      };

      const snap = await db.collection("orders").doc(req.params.id).get();
      const order = snap.data() as Order | undefined;

      if (!order) {
        throw new InternalError("The order does not exist");
      }

      const _currency = currencyOptions.find(
        _currency => _currency.name === currency
      ) as AppCurrency;

      await firestore()
        .collection("orders")
        .doc(req.params.id)
        .update({
          paymentStatus: "PAID - GO AHEAD (Bank Transfer)",
          currency,
          transferDetails: `Website: Paid  ${
            _currency.sign
          }${amount.toLocaleString()}  with ${accountName} to ${
            _currency.name
          } - ${bankMap[_currency.name]} ${referenceNumber}`
        });

      // Send email to admin and client
      await sendEmailToAddress(
        ["info@regalflowers.com.ng"],
        templateRender({ ...order }, "new-order"),
        "New Order",
        "5055243"
      );

      await sendEmailToAddress(
        [order.client.email as string],
        templateRender({ ...order }, "order"),
        "Thank you for your order",
        "5055243"
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
      return new SuccessResponse("Payment is successful", true).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default manualTransfer;
