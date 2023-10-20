import Joi from "@hapi/joi";
import { businessValidation } from "../../../../helpers/validator";

const validation = {
  signup: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().allow("").default(""),
    gender: Joi.string().allow("").default(""),
    city: Joi.string().allow("").default(""),
    phone: Joi.string().allow("").default(""),
    phoneAlt: Joi.string().allow("").default(""),
    state: Joi.string().allow("").default(""),
    dob: Joi.string().allow("").default(""),
    ...businessValidation
  }),
  login: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    ...businessValidation
  }),
  requestOTP: Joi.object().keys({
    email: Joi.string().required(),
    ...businessValidation
  }),
  validateOTP: Joi.object().keys({
    email: Joi.string().required(),
    code: Joi.string().required(),
    ...businessValidation
  }),
  changePassword: Joi.object().keys({
    password: Joi.string().required(),
    ...businessValidation
  }),
  handshake: Joi.object({
    ...businessValidation
  })
};

export default validation;
