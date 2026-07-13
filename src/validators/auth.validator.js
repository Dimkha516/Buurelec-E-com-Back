const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    "string.empty": "L'email est requis",
    "string.email": "Format email invalide",
    "string.max": "Email must not exceed 255 characters",
    "any.required": "L'email est requis",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Le mot de passe est requis",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
    "any.empty": "Le prénom est obligatoire",
    "any.required": "Le prénom est obligatoire",
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "any.empty": "Le nom est requis",
    "any.required": "Le nom est requis",
  }),
  phone: Joi.string()
    .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
    .required()
    .messages({
      "string.pattern.base":
        // "Phone must be a valid Senegalese number (9 digits starting with 77, 78, 76, 70, 71, or 33)",
      "Format téléphone incorrect (9 chiffres commençant avec 77, 78, 76, 70, 71, ou 33)",
      "any.required": "Le téléphone est requis",
      "any.empty": "Le téléphone est requis",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    // "string.email": "Email must be a valid email address",
    "string.email": "Format email incorrect",
    "any.required": "Email obligatoire",
    "any.empty": "Email obligatoire",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password obligatoire",
    "any.empty": "Password obligatoire",
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
