import Joi from "@hapi/joi";

const validation = {
  checkoutOrder: Joi.object().keys({
    shouldCreateAccount: Joi.boolean().required(),
    shouldSaveAddress: Joi.boolean().required(),
    orderData: Joi.object().keys({
      deliveryDate: Joi.string().required(),
      deliveryMessage: Joi.string().valid("").default(""),
      despatchLocation: Joi.string().valid("").default(""),
      purpose: Joi.string().valid("").default(""),
      adminNotes: Joi.string().valid("").default(""),
      recipient: Joi.object().keys({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        phoneAlt: Joi.string().valid("").default(""),
        residenceType: Joi.string().valid("").default(""),
        state: Joi.string().valid("").default(""),
        address: Joi.string().valid("").default(""),
        method: Joi.string().valid("").default("")
      })
    }),
    userData: Joi.object().keys({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().valid("").default(""),
      password: Joi.string()
    })
  })
};

export default validation;
