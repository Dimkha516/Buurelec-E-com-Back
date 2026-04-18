const Joi = require("joi");

const baseSchema = {
  orderId: Joi.string().uuid().required().messages({
    "string.guid": "Order ID must be a valid UUID",
    "any.required": "Order ID is required",
  }),
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  productName: Joi.string().required().messages({
    "any.required": "Product name is required",
  }),
  unitPrice: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Unit price must be a positive number",
    "any.required": "Unit price is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  totalPrice: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Total price must be a positive number",
    "any.required": "Total price is required",
  }),
};

const createOrderItemSchema = Joi.object(baseSchema);

const updateOrderItemSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createOrderItemSchema, updateOrderItemSchema };
