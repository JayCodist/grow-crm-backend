import Joi from "@hapi/joi";

const validation = {
  clientMessage: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    message: Joi.string().required()
  })
};

export default validation;
