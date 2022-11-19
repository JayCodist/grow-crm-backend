import Joi from "@hapi/joi";

const validation = {
  verifyPaymentPaystack: Joi.object().keys({
    version: Joi.number().min(0),
    os: Joi.string().required().valid("android", "ios")
  })
};

export default validation;
