const Joi = require("joi");

const baseSchema = {
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Email must be a valid email address",
    "string.max": "Email must not exceed 255 characters",
    "any.required": "Email is required",
  }),
  userId: Joi.string().uuid().allow(null).messages({
    "string.guid": "User ID must be a valid UUID",
  }),
  isSubscribed: Joi.boolean(),
};

const createNewsletterSubscriberSchema = Joi.object(baseSchema);

const updateNewsletterSubscriberSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = {
  createNewsletterSubscriberSchema,
  updateNewsletterSubscriberSchema,
};
