const Joi = require("joi");

const baseSchema = {
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
};

const createCartSchema = Joi.object(baseSchema);

const updateCartSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

const addToCartSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Quantity must be at least 1",
  }),
});

module.exports = { createCartSchema, updateCartSchema, addToCartSchema };
