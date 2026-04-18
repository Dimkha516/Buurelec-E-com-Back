const Joi = require("joi");

const baseSchema = {
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
};

const createWishlistItemSchema = Joi.object(baseSchema);

const updateWishlistItemSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createWishlistItemSchema, updateWishlistItemSchema };
