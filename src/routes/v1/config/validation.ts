import Joi from "@hapi/joi";

const validation = {
  mobileVersionCheck: Joi.object().keys({
    version: Joi.number().min(0),
    os: Joi.string().required().valid("android", "ios")
  }),
  doWordPressSync: Joi.object().keys({
    business: Joi.string().required().valid("regalFlowers", "floralHub"),
    imageUpdateSlugs: Joi.string()
  })
};

export default validation;
