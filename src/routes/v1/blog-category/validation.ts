import Joi from "@hapi/joi";
import { businessValidation } from "../../../helpers/validator";

const validation = {
  create: Joi.object().keys({
    name: Joi.string().required()
  }),
  update: Joi.object().keys({
    name: Joi.string().required()
  }),
  business: Joi.object().keys(businessValidation)
};

export default validation;
