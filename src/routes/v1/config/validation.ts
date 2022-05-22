import Joi from "@hapi/joi";

const validation = {
  mobileVersionCheck: Joi.object().keys({
    version: Joi.number().min(0),
    os: Joi.string().required().valid("android", "ios")
  }),
  getWPProduct: Joi.object().keys({
    business: Joi.string().required().valid("regalFlowers", "floralHub"),
    slug: Joi.string().required()
  })
};

export default validation;
