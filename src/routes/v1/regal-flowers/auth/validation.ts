import Joi from "@hapi/joi";

const validation = {
  signup: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().allow("").default(""),
    address: Joi.array().items(Joi.string()),
    gender: Joi.string().allow("").default(""),
    city: Joi.string().allow("").default(""),
    phone: Joi.string().allow("").default(""),
    phoneAlt: Joi.string().allow("").default(""),
    state: Joi.string().allow("").default(""),
    dob: Joi.string().allow("").default("")
  }),
  login: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
};

export default validation;
