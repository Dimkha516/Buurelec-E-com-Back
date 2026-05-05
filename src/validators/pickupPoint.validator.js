const Joi = require("joi");

const baseSchema = {
  name: Joi.string().min(2).max(150).required().messages({
    "any.required": "Name is required",
  }),
  address: Joi.string().min(2).max(255).required().messages({
    "any.required": "Address is required",
  }),
  city: Joi.string().min(2).max(100).required().messages({
    "any.required": "City is required",
  }),
  phone: Joi.string().allow(null, ""),
  isActive: Joi.boolean().default(true),
};

const createPickupPointSchema = Joi.object(baseSchema);

const updatePickupPointSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createPickupPointSchema, updatePickupPointSchema };
