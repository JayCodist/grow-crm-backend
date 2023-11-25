import Joi from "@hapi/joi";
import { businessValidation } from "../../../../helpers/validator";

const validation = {
  verifyPaymentPaystack: Joi.object().keys({
    ...businessValidation,
    ref: Joi.string().required()
  }),
  verifyPaymentMonnify: Joi.object().keys({
    ...businessValidation,
    ref: Joi.string().required()
  }),
  verifyPaymentPaypal: Joi.object().keys({
    ...businessValidation,
    ref: Joi.string().required()
  }),
  manualTransfer: Joi.object().keys({
    amount: Joi.number().required(),
    accountName: Joi.string().required().allow(""),
    referenceNumber: Joi.string().allow(""),
    currency: Joi.string().required().valid("NGN", "USD", "GBP")
  })
};

export default validation;
