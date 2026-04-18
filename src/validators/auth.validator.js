const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Email must be a valid email address",
    "string.max": "Email must not exceed 255 characters",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "any.required": "Last name is required",
  }),
  phone: Joi.string()
    .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone must be a valid Senegalese number (9 digits starting with 77, 78, 76, 70, 71, or 33)",
      "any.required": "Phone is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
