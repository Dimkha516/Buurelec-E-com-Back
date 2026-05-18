const Joi = require("joi");

const baseSchema = {
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(255).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(2).required().messages({
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "any.required": "Last name is required",
  }),
  phone: Joi.string()
    .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "Phone must be a valid Senegalese number (9 digits starting with 77, 78, 76, 70, 71, or 33)",
    }),
  avatarUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Avatar URL must be a valid URL",
  }),
  role: Joi.string().valid("CUSTOMER", "ADMIN").default("CUSTOMER"),
  isActive: Joi.boolean().default(true),
  emailVerified: Joi.boolean().default(false),
};

const createAdminUserSchema = Joi.object(baseSchema);

const updateAdminUserSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

module.exports = { createAdminUserSchema, updateAdminUserSchema };
