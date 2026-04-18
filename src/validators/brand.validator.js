const Joi = require("joi");

const baseSchema = {
  name: Joi.string().min(2).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  slug: Joi.string().required().messages({
    "any.required": "Slug is required",
  }),
  logoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Logo URL must be a valid URL",
  }),
  isActive: Joi.boolean(),
};

const createBrandSchema = Joi.object(baseSchema);

const updateBrandSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createBrandSchema, updateBrandSchema };
