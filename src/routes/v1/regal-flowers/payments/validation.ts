import Joi from "@hapi/joi";

const validation = {
  verifyPaymentPaystack: Joi.object().keys({
    ref: Joi.string().required()
  }),
  verifyPaymentMonnify: Joi.object().keys({
    ref: Joi.string().required()
  })
};

export default validation;
