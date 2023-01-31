import Joi from "@hapi/joi";

const validation = {
  checkoutOrder: Joi.object({
    shouldCreateAccount: Joi.boolean().required(),
    shouldSaveAddress: Joi.boolean().required(),
    deliveryLocation: Joi.object({
      name: Joi.string().required(),
      amount: Joi.number().greater(-1),
      label: Joi.string().allow("")
    }).allow(null),
    orderData: Joi.object({
      deliveryDate: Joi.string().required(),
      deliveryMessage: Joi.string().default("").allow(""),
      despatchLocation: Joi.string().default("").allow(""),
      purpose: Joi.string().default("").allow(""),
      adminNotes: Joi.string().default("").allow(""),
      recipient: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        phoneAlt: Joi.string().default("").allow(""),
        residenceType: Joi.string().default("").allow(""),
        state: Joi.string().default("").allow(""),
        address: Joi.string().default("").allow(""),
        method: Joi.string().default("").allow("")
      })
    }),
    userData: Joi.object().keys({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().default("").allow(""),
      password: Joi.string()
    })
  })
};

export default validation;
