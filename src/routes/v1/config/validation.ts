import Joi from "@hapi/joi";

const validation = {
  mobileVersionCheck: Joi.object().keys({
    version: Joi.number().min(1),
    os: Joi.string().required().valid("android", "ios")
  })
};

export default validation;
