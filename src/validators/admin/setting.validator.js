const Joi = require("joi");

// All fields are optional for partial updates (PUT /admin/settings acts as PATCH).
const updateSettingsSchema = Joi.object({
  // Contact
  contactEmail: Joi.string().email().allow(null, "").messages({
    "string.email": "Contact email must be a valid email address",
  }),
  contactPhone: Joi.string().max(50).allow(null, ""),
  contactAddress: Joi.string().max(255).allow(null, ""),
  contactCity: Joi.string().max(100).allow(null, ""),
  contactCountry: Joi.string().max(100).allow(null, ""),

  // Branding
  siteName: Joi.string().min(1).max(100),
  siteTagline: Joi.string().max(255).allow(null, ""),
  logoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Logo URL must be a valid URL",
  }),
  faviconUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Favicon URL must be a valid URL",
  }),

  // Social media (all optional URLs / strings)
  facebookUrl: Joi.string().uri().allow(null, ""),
  instagramUrl: Joi.string().uri().allow(null, ""),
  whatsappNumber: Joi.string().max(50).allow(null, ""),
  tiktokUrl: Joi.string().uri().allow(null, ""),
  twitterUrl: Joi.string().uri().allow(null, ""),
  youtubeUrl: Joi.string().uri().allow(null, ""),

  // Business & shipping
  currency: Joi.string().length(3).uppercase(),
  homeDeliveryCost: Joi.number().precision(2).min(0),
  pickupDeliveryCost: Joi.number().precision(2).min(0),
  defaultTaxRate: Joi.number().precision(2).min(0).max(100),
}).min(1).messages({
  "object.min": "At least one field must be provided",
});

module.exports = { updateSettingsSchema };
