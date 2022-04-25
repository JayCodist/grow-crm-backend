import Joi from "@hapi/joi";

const validation = {
  create: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    firstName: Joi.string().required().allow(""),
    lastName: Joi.string().required().allow(""),
    address: Joi.array().items(Joi.string()).required(),
    phones: Joi.array().items(Joi.string()).required(),
    category: Joi.array().items(Joi.string()),
    gender: Joi.string().default(""),
    city: Joi.string().default(""),
    email: Joi.string().email().default(""),
    phone: Joi.string().required(),
    phoneAlt: Joi.string().default(""),
    phoneAlt2: Joi.string().default(""),
    state: Joi.string().default(""),
    dob: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .allow(""),
    timeStamp: Joi.date().timestamp()
  }),
  paginate: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(0),
    sortField: Joi.string().allow(""),
    searchField: Joi.string().allow(""),
    searchValue: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc")
  }),

  update: Joi.object().keys({
    name: Joi.string(),
    firstName: Joi.string().allow(""),
    lastName: Joi.string().allow(""),
    address: Joi.array().items(Joi.string()),
    phones: Joi.array().items(Joi.string()),
    category: Joi.array().items(Joi.string()),
    gender: Joi.string(),
    city: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().allow(""),
    phoneAlt: Joi.string().allow(""),
    phoneAlt2: Joi.string().allow(""),
    state: Joi.string(),
    dob: Joi.date().allow("")
  }),
  delete: Joi.object().keys({
    id: Joi.string().required()
  })
};

export default validation;
