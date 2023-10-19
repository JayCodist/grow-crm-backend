import Joi from "@hapi/joi";
import { businessValidation } from "../../../../helpers/validator";

const validation = {
  paginate: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(0),
    sortField: Joi.string().allow(""),
    searchField: Joi.string().allow(""),
    searchValue: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc"),
    ...businessValidation
  }),
  slug: Joi.object().keys({
    slug: Joi.string().required(),
    ...businessValidation
  })
};

export default validation;
