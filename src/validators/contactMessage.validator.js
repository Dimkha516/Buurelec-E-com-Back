const Joi = require("joi");

const baseSchema = {
  userId: Joi.string().uuid().allow(null).messages({
    "string.guid": "User ID must be a valid UUID",
  }),
  name: Joi.string().min(2).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Email must be a valid email address",
    "string.max": "Email must not exceed 255 characters",
    "any.required": "Email is required",
  }),
  subject: Joi.string().min(2).required().messages({
    "string.min": "Subject must be at least 2 characters",
    "any.required": "Subject is required",
  }),
  message: Joi.string().min(10).required().messages({
    "string.min": "Message must be at least 10 characters",
    "any.required": "Message is required",
  }),
  status: Joi.string().valid("UNREAD", "READ", "REPLIED", "ARCHIVED"),
};

const createContactMessageSchema = Joi.object(baseSchema);

const updateContactMessageSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createContactMessageSchema, updateContactMessageSchema };
