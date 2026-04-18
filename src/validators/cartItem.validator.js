const Joi = require("joi");

const baseSchema = {
  cartId: Joi.string().uuid().required().messages({
    "string.guid": "Cart ID must be a valid UUID",
    "any.required": "Cart ID is required",
  }),
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Quantity must be at least 1",
  }),
};

const createCartItemSchema = Joi.object(baseSchema);

const updateCartItemSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createCartItemSchema, updateCartItemSchema };
