const Joi = require("joi");

const baseSchema = {
  title: Joi.string().min(2).required().messages({
    "string.min": "Title must be at least 2 characters",
    "any.required": "Title is required",
  }),
  subtitle: Joi.string().allow(null, ""),
  buttonText: Joi.string().allow(null, ""),
  buttonLink: Joi.string().allow(null, ""),
  imageUrl: Joi.string().uri().required().messages({
    "string.uri": "Image URL must be a valid URL",
    "any.required": "Image URL is required",
  }),
  bgColor: Joi.string().allow(null, ""),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean(),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().allow(null),
};

const createBannerSchema = Joi.object(baseSchema);

const updateBannerSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createBannerSchema, updateBannerSchema };
