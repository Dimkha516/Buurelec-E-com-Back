const Joi = require("joi");

const baseSchema = {
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  name: Joi.string().min(2).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  sortOrder: Joi.number().integer().default(0),
};

const createProductFeatureSchema = Joi.object(baseSchema);

const updateProductFeatureSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createProductFeatureSchema, updateProductFeatureSchema };
