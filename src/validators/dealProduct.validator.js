const Joi = require("joi");

const baseSchema = {
  dealId: Joi.string().uuid().required().messages({
    "string.guid": "Deal ID must be a valid UUID",
    "any.required": "Deal ID is required",
  }),
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  dealPrice: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Deal price must be a positive number",
    "any.required": "Deal price is required",
  }),
};

const createDealProductSchema = Joi.object(baseSchema);

const updateDealProductSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createDealProductSchema, updateDealProductSchema };
