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
  icon: Joi.string().allow(null, ""),
  imageUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Image URL must be a valid URL",
  }),
  parentId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Parent ID must be a valid UUID",
  }),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean(),
};

const createCategorySchema = Joi.object(baseSchema);

const updateCategorySchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createCategorySchema, updateCategorySchema };
