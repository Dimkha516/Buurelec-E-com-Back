const Joi = require("joi");

const baseSchema = {
  name: Joi.string().min(2).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  slug: Joi.string().required().messages({
    "any.required": "Slug is required",
  }),
  description: Joi.string().allow(null, ""),
  price: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  originalPrice: Joi.number().precision(2).positive().allow(null).messages({
    "number.positive": "Original price must be a positive number",
  }),
  sku: Joi.string().allow(null, ""),
  stock: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Stock cannot be negative",
  }),
  badge: Joi.string().valid("NEW", "SALE", "HOT").allow(null),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  categoryId: Joi.string().uuid().required().messages({
    "string.guid": "Category ID must be a valid UUID",
    "any.required": "Category ID is required",
  }),
  brandId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Brand ID must be a valid UUID",
  }),
};

const createProductSchema = Joi.object(baseSchema);

const updateProductSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createProductSchema, updateProductSchema };
