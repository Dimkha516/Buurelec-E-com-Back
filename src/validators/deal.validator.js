const Joi = require("joi");

const baseSchema = {
  title: Joi.string().min(2).required().messages({
    "string.min": "Title must be at least 2 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().allow(null, ""),
  startDate: Joi.date().iso().required().messages({
    "date.format": "Start date must be a valid ISO date",
    "any.required": "Start date is required",
  }),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "date.greater": "End date must be after start date",
    "any.required": "End date is required",
  }),
  isActive: Joi.boolean(),
};

const createDealSchema = Joi.object(baseSchema);

const updateDealSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createDealSchema, updateDealSchema };
