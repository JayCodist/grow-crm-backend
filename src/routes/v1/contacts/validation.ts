import Joi from "@hapi/joi";

const validation = {
  create: Joi.object().keys({
    objectId: Joi.string().required(),
    id: Joi.string().required(),
    key: Joi.string().required(),
    name: Joi.string().required(),
    firstName: Joi.string().required().allow(""),
    lastName: Joi.string().required().allow(""),
    address: Joi.array().items(Joi.string()),
    phones: Joi.array().items(Joi.string()),
    category: Joi.array().items(Joi.string()),
    gender: Joi.string().required(),
    city: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(""),
    phoneAlt: Joi.string().allow(""),
    phoneAlt2: Joi.string().allow(""),
    state: Joi.string().required(),
    dob: Joi.date().allow(""),
    timeStamp: Joi.date().timestamp().required()
  })
};

export default validation;
