import Joi from "@hapi/joi";

const validation = {
  pagination: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(1),
    sortField: Joi.string(),
    searchField: Joi.string(),
    searchValue: Joi.string(),
    sortType: Joi.string().valid("asc", "desc")
  }),
  create: Joi.object().keys({
    admin: Joi.string().min(3).max(50).required(),
    client: Joi.string().min(3).max(100).required(),
    orderID: Joi.string().min(2).max(20).required()
  })
};

export default validation;
