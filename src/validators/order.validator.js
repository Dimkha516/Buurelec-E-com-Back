const Joi = require("joi");

const baseSchema = {
  orderNumber: Joi.string().required().messages({
    "any.required": "Order number is required",
  }),
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    )
    .default("PENDING"),
  subtotal: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Subtotal must be a positive number",
    "any.required": "Subtotal is required",
  }),
  shippingCost: Joi.number().precision(2).min(0).default(0),
  taxAmount: Joi.number().precision(2).min(0).default(0),
  totalAmount: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Total amount must be a positive number",
    "any.required": "Total amount is required",
  }),
  shippingAddressId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Shipping address ID must be a valid UUID",
  }),
  billingAddressId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Billing address ID must be a valid UUID",
  }),
  paymentMethod: Joi.string().allow(null, ""),
  paymentStatus: Joi.string()
    .valid("PENDING", "PAID", "FAILED", "REFUNDED")
    .default("PENDING"),
  notes: Joi.string().allow(null, ""),
};

const createOrderSchema = Joi.object(baseSchema);

const updateOrderSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createOrderSchema, updateOrderSchema };
