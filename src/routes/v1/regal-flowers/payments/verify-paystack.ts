import express from "express";
import fetch from "node-fetch";
import { ApiError, PaymentFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import validator from "../../../../helpers/validator";
import validation from "./validation";

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
        return new SuccessResponse("Payment is successful", true).send(res);
      }

      return new PaymentFailureError(
        `Unable to make payment: ${json.data.message}`
      );
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default verifyPaystack;
