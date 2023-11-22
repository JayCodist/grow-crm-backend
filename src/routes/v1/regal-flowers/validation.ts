import Joi from "@hapi/joi";
import { businessValidation } from "../../../helpers/validator";

const validation = {
  subscribe: Joi.object().keys({
    email: Joi.string().required(),
    ...businessValidation
  })
};

export default validation;
