import Joi from "@hapi/joi";

const validation = {
  create: Joi.object().keys({
    amount: Joi.number().allow(""),
    business: Joi.string().allow(""),
    client: Joi.object().keys({
      email: Joi.string().allow(""),
      phone: Joi.string().allow(""),
      name: Joi.string().allow(""),
      password: Joi.string().allow("")
    }),
    deliveryZone: Joi.string().allow(""),
    deliveryDate: Joi.string().allow(""),
    deliveryState: Joi.string().allow(""),
    orderProducts: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().allow(""),
        quantity: Joi.number().allow("")
      })
    ),
    paymentStatus: Joi.string().allow(""),
    recipient: Joi.object().keys({
      address: Joi.string().allow(""),
      email: Joi.string().allow(""),
      phone: Joi.string().allow(""),
      name: Joi.string().allow(""),
      state: Joi.string().allow(""),
      phoneAlt: Joi.string().allow("")
    }),
    pickUpState: Joi.string().allow(""),
    pickUpLocation: Joi.string().allow(""),
    purpose: Joi.string().allow(""),
    message: Joi.string().allow(""),
    additionalInfo: Joi.string().allow(""),
    cost: Joi.number().allow("")
  })
};

export default validation;
