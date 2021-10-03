import Joi from "@hapi/joi";

const validation = {
  pagination: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(1),
    sortField: Joi.string(),
    sortType: Joi.string().valid("asc", "desc")
  })
};

export default validation;
