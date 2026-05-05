const Joi = require("joi");

const checkoutSchema = Joi.object({
  deliveryMethod: Joi.string()
    .valid("HOME_DELIVERY", "PICKUP_POINT")
    .required()
    .messages({ "any.required": "Delivery method is required" }),
  shippingAddressId: Joi.string()
    .uuid()
    .when("deliveryMethod", {
      is: "HOME_DELIVERY",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "Shipping address is required for home delivery",
      "any.unknown": "Shipping address is only allowed for home delivery",
    }),
  pickupPointId: Joi.string()
    .uuid()
    .when("deliveryMethod", {
      is: "PICKUP_POINT",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "Pickup point is required for pickup delivery",
      "any.unknown": "Pickup point is only allowed for pickup delivery",
    }),
  paymentMethod: Joi.string()
    .valid("WAVE", "ORANGE_MONEY", "BANK_CARD", "CASH")
    .required()
    .messages({ "any.required": "Payment method is required" }),
  paymentTiming: Joi.string()
    .valid("PREPAID", "ON_DELIVERY")
    .required()
    .messages({ "any.required": "Payment timing is required" }),
  deliveryDate: Joi.date()
    .iso()
    .required()
    .custom((value, helpers) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        return helpers.message("Delivery date must be today or later");
      }
      return value;
    })
    .messages({ "any.required": "Delivery date is required" }),
  notes: Joi.string().max(500).allow(null, ""),
}).custom((value, helpers) => {
  if (value.paymentMethod === "CASH" && value.paymentTiming !== "ON_DELIVERY") {
    return helpers.message("Cash payment is only available on delivery");
  }
  return value;
}, "payment combination validation");

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
  paymentMethod: Joi.string()
    .valid("WAVE", "ORANGE_MONEY", "BANK_CARD", "CASH")
    .allow(null),
  paymentTiming: Joi.string()
    .valid("PREPAID", "ON_DELIVERY")
    .default("PREPAID"),
  paymentStatus: Joi.string()
    .valid("PENDING", "PAID", "FAILED", "REFUNDED")
    .default("PENDING"),
  deliveryMethod: Joi.string()
    .valid("HOME_DELIVERY", "PICKUP_POINT")
    .default("HOME_DELIVERY"),
  pickupPointId: Joi.string().uuid().allow(null),
  deliveryDate: Joi.date().iso().allow(null),
  notes: Joi.string().allow(null, ""),
};

const createOrderSchema = Joi.object(baseSchema);

const updateOrderSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createOrderSchema, updateOrderSchema, checkoutSchema };
