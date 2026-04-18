const Joi = require("joi");

const baseSchema = {
  productId: Joi.string().uuid().required().messages({
    "string.guid": "Product ID must be a valid UUID",
    "any.required": "Product ID is required",
  }),
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating must not exceed 5",
    "any.required": "Rating is required",
  }),
  title: Joi.string().allow(null, ""),
  comment: Joi.string().allow(null, ""),
  isVisible: Joi.boolean(),
};

const createReviewSchema = Joi.object(baseSchema);

const updateReviewSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createReviewSchema, updateReviewSchema };
