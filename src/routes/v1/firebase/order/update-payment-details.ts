import express from "express";
import { firestore } from "firebase-admin";
import validator from "../../../../helpers/validator";
import { ApiError, InternalError } from "../../../../core/ApiError";
import { Order } from "../../../../database/model/Order";
import validation from "./validation";
import {
  PaymentMethod,
  currencyOptions,
  paymentMethodMap
} from "../../../../helpers/constants";
import {
  AppCurrency,
  AppCurrencyName
} from "../../../../database/model/AppConfig";
import { SuccessResponse } from "../../../../core/ApiResponse";
import { getPriceDisplay } from "../../../../helpers/render";

const db = firestore();

const updatePaymentMethodDetails = express.Router();

updatePaymentMethodDetails.put(
  "/:id",
  validator(validation.updatePaymentMethodDetails, "body"),
  async (req, res) => {
    try {
      const { currency, paymentMethod } = req.body as {
        currency: AppCurrencyName;
        paymentMethod: PaymentMethod;
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
          paymentDetails: `Website: Not Paid ${getPriceDisplay(
            order.amount,
            _currency
          )} ${paymentMethodMap[paymentMethod]}`,
          paymentMethod
        });

      return new SuccessResponse("Payment method updated", true).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default updatePaymentMethodDetails;
