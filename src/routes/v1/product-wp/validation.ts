import Joi from "@hapi/joi";

const validation = {
  paginate: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(0),
    sortField: Joi.string().allow(""),
    searchField: Joi.string().allow(""),
    searchValue: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc"),
    // tagField: Joi.string().allow(""),
    tagValue: Joi.string().allow("regular", "vip", "bundled")
  }),
  create: Joi.object().keys({
    name: Joi.string().required(),
    _nameSearch: Joi.string().allow(""),
    subtitle: Joi.string().allow(""),
    temporaryNote: Joi.string().allow(""),
    slug: Joi.string().allow(""),
    category: Joi.string().allow(""),
    type: Joi.string().allow(""),
    featured: Joi.boolean(),
    sku: Joi.string().allow(""),
    price: Joi.number().required(),
    images: Joi.array().items(
      Joi.object().keys({
        alt: Joi.string().allow(""),
        src: Joi.string().required(),
        id: Joi.number().integer().min(0)
      })
    ),
    variants: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        price: Joi.number().required(),
        class: Joi.string().allow("")
      })
    ),
    addonsGroups: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        image: Joi.string().allow(""),
        description: Joi.string().allow(""),
        addons: Joi.array().items(
          Joi.object().keys({
            name: Joi.string().required(),
            price: Joi.number().required(),
            image: Joi.string().allow("")
          })
        ),
        slug: Joi.string().allow("")
      })
    ),
    description: Joi.string().allow(""),
    longDescription: Joi.string().allow(""),
    designOptions: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    timeStamp: Joi.string().allow("")
  })
};

export default validation;
