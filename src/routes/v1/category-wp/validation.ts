import Joi from "@hapi/joi";

const validation = {
  paginate: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(0),
    sortField: Joi.string().allow(""),
    searchField: Joi.string().allow(""),
    searchValue: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc")
  })
};

export default validation;
