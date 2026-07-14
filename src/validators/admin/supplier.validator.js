const Joi = require("joi");

const baseSchema = {
  name: Joi.string().min(2).max(150).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  contactPerson: Joi.string().max(150).allow(null, ""),
  contactEmail: Joi.string().email().allow(null, "").messages({
    "string.email": "Contact email must be a valid email address",
  }),
  contactPhone: Joi.string().max(50).allow(null, ""),
  address: Joi.string().max(255).allow(null, ""),
  city: Joi.string().max(100).allow(null, ""),
  country: Joi.string().max(100).allow(null, ""),
  notes: Joi.string().max(1000).allow(null, ""),
  isActive: Joi.boolean(),
};

const createSupplierSchema = Joi.object(baseSchema);

const updateSupplierSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createSupplierSchema, updateSupplierSchema };
