import Joi from "@hapi/joi";
import { businessValidation } from "../../../helpers/validator";

const validation = {
  pagination: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(1),
    sortField: Joi.string().allow(""),
    searchStr: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc"),
    ...businessValidation
  }),
  create: Joi.object().keys({
    title: Joi.string().min(3).max(50).required(),
    featuredImage: Joi.string().optional(),
    active: Joi.boolean().required(),
    body: Joi.string().required(),
    readMinutes: Joi.number().optional(),
    slug: Joi.string().min(3).max(50).required(),
    category: Joi.array().items(Joi.string()).required(),
    excerpt: Joi.string().optional()
  }),
  update: Joi.object().keys({
    title: Joi.string().min(3).max(50).optional(),
    featuredImage: Joi.string().optional(),
    active: Joi.boolean().optional(),
    body: Joi.string().optional(),
    readMinutes: Joi.number().optional(),
    slug: Joi.string().min(3).max(50).optional(),
    category: Joi.array().items(Joi.string()).optional(),
    excerpt: Joi.string().optional()
  }),
  business: Joi.object().keys(businessValidation)
};

export default validation;
