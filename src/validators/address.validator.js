const Joi = require("joi");

const baseSchema = {
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
  label: Joi.string().max(100).messages({
    "string.max": "Label must not exceed 100 characters",
  }),
  firstName: Joi.string().min(2).required().messages({
    "string.min": "First Name must be at least 2 characters",
    "any.required": "First Name is required",
  }),
  lastName: Joi.string().min(2).required().messages({
    "string.min": "Last Name must be at least 2 characters",
    "any.required": "Last Name is required",
  }),
  street: Joi.string().required().messages({
    "any.required": "Street is required",
  }),
  city: Joi.string().required().messages({
    "any.required": "City is required",
  }),
  state: Joi.string().allow(null, ""),
  zipCode: Joi.string().required().messages({
    "any.required": "Zip code is required",
  }),
  country: Joi.string().required().messages({
    "any.required": "Country is required",
  }),
  phone: Joi.string()
    .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
    .messages({
      "string.pattern.base":
        "Phone must be a valid Senegalese number (9 digits starting with 77, 78, 76, 70, 71, or 33)",
    }),
  isDefault: Joi.boolean(),
};

const createAddressSchema = Joi.object(baseSchema);

const updateAddressSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createAddressSchema, updateAddressSchema };
