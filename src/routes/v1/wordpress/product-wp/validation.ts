import Joi from "@hapi/joi";

const validation = {
  paginate: Joi.object().keys({
    pageNumber: Joi.number().integer().min(1),
    pageSize: Joi.number().integer().min(0),
    sortField: Joi.string().allow(""),
    categories: Joi.string().allow(""),
    tags: Joi.string().allow(""),
    sortType: Joi.string().valid("asc", "desc"),
    productClass: Joi.string().valid("vip", "regular").optional(),
    budget: Joi.string().allow(""),
    flowerType: Joi.string().allow(""),
    design: Joi.string().allow(""),
    packages: Joi.string().allow(""),
    delivery: Joi.string().allow(""),
    flowerName: Joi.string().allow("")
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
  }),
  slug: Joi.object().keys({
    slug: Joi.string().required()
  }),
  related: Joi.object().keys({
    slug: Joi.string().required()
  }),
  slugMultiple: Joi.object().keys({
    slugs: Joi.string().required()
  })
};

export default validation;
