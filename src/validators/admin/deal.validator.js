const Joi = require("joi");

// Add a product to a deal: dealId comes from URL, body holds productId + dealPrice
const addDealProductSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  dealPrice: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Deal price must be a positive number",
    "any.required": "Deal price is required",
  }),
});

// Update price for an existing deal-product link
const updateDealProductSchema = Joi.object({
  dealPrice: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Deal price must be a positive number",
    "any.required": "Deal price is required",
  }),
});

module.exports = { addDealProductSchema, updateDealProductSchema };
