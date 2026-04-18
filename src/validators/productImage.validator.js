const Joi = require("joi");

const baseSchema = {
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  url: Joi.string().uri().required().messages({
    "string.uri": "URL must be a valid URL",
    "any.required": "URL is required",
  }),
  altText: Joi.string().allow(null, ""),
  sortOrder: Joi.number().integer().default(0),
  isPrimary: Joi.boolean(),
};

const createProductImageSchema = Joi.object(baseSchema);

const updateProductImageSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createProductImageSchema, updateProductImageSchema };
