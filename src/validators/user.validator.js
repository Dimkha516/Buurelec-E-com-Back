const Joi = require("joi");

//
const baseSchema = {
  email: Joi.string()
  .email()
  .max(255)
  .required()
  .messages({
    // "string.email": "Email must be a valid email address",
    "string.email": "Format email invalide",
    "string.max": "Email must not exceed 255 characters",
    "any.required": "Email is required",
  }),
  passwordHash: Joi.string().min(6).max(255).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 255 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(2).required().messages({
    "string.min": "First Name must be at least 2 characters",
    "any.required": "First Name is required",
  }),
  lastName: Joi.string().min(2).required().messages({
    "string.min": "Last Name must be at least 2 characters",
    "any.required": "Last Name is required",
  }),
  phone: Joi.string()
    .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
    .required()
    .messages({
      "string.pattern.base":
      "Format téléphone incorrect (9 chiffres commençant avec 77, 78, 76, 70, 71, ou 33)",
      "any.required": "Phone is required",
    }), 
    // "Phone must be a valid Senegalese number (9 digits starting with 77, 78, 76, 70, 71, or 33)",
};

//
const createUserSchema = Joi.object(baseSchema);

//
const updateUserSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createUserSchema, updateUserSchema };
