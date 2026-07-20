const Joi = require("joi");

// GPS coordinates captured on the client via the browser Geolocation API,
// used when the customer chooses "use my current location".
const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
}).messages({
  "any.required":
    "Latitude and longitude are required to use your current location",
});

const checkoutSchema = Joi.object({
  deliveryMethod: Joi.string()
    .valid("HOME_DELIVERY", "PICKUP_POINT")
    .required()
    .messages({ "any.required": "Delivery method is required" }),
  shippingAddressId: Joi.string()
    .uuid()
    .when("deliveryMethod", {
      is: "HOME_DELIVERY",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.unknown": "Shipping address is only allowed for home delivery",
    }),
  coordinates: coordinatesSchema
    .when("deliveryMethod", {
      is: "HOME_DELIVERY",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.unknown": "Current location is only allowed for home delivery",
    }),
  pickupPointId: Joi.string()
    .uuid()
    .when("deliveryMethod", {
      is: "PICKUP_POINT",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "Pickup point is required for pickup delivery",
      "any.unknown": "Pickup point is only allowed for pickup delivery",
    }),
  paymentMethod: Joi.string()
    .valid("WAVE", "ORANGE_MONEY", "BANK_CARD", "CASH")
    .required()
    .messages({ "any.required": "Payment method is required" }),
  paymentTiming: Joi.string()
    .valid("PREPAID", "ON_DELIVERY")
    .required()
    .messages({ "any.required": "Payment timing is required" }),
  deliveryDate: Joi.date()
    .iso()
    .required()
    .custom((value, helpers) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        return helpers.message("Delivery date must be today or later");
      }
      return value;
    })
    .messages({ "any.required": "Delivery date is required" }),
  notes: Joi.string().max(500).allow(null, ""),
}).custom((value, helpers) => {
  if (value.paymentMethod === "CASH" && value.paymentTiming !== "ON_DELIVERY") {
    return helpers.message("Cash payment is only available on delivery");
  }
  // Home delivery needs exactly one target: a saved address OR current location.
  if (value.deliveryMethod === "HOME_DELIVERY") {
    const hasAddress = Boolean(value.shippingAddressId);
    const hasCoords = Boolean(value.coordinates);
    if (hasAddress === hasCoords) {
      return helpers.message(
        "For home delivery, provide either a shipping address or your current location",
      );
    }
  }
  return value;
}, "checkout combination validation");

const baseSchema = {
  orderNumber: Joi.string().required().messages({
    "any.required": "Order number is required",
  }),
  userId: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    )
    .default("PENDING"),
  subtotal: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Subtotal must be a positive number",
    "any.required": "Subtotal is required",
  }),
  shippingCost: Joi.number().precision(2).min(0).default(0),
  taxAmount: Joi.number().precision(2).min(0).default(0),
  totalAmount: Joi.number().precision(2).positive().required().messages({
    "number.positive": "Total amount must be a positive number",
    "any.required": "Total amount is required",
  }),
  shippingAddressId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Shipping address ID must be a valid UUID",
  }),
  billingAddressId: Joi.string().uuid().allow(null).messages({
    "string.guid": "Billing address ID must be a valid UUID",
  }),
  paymentMethod: Joi.string()
    .valid("WAVE", "ORANGE_MONEY", "BANK_CARD", "CASH")
    .allow(null),
  paymentTiming: Joi.string()
    .valid("PREPAID", "ON_DELIVERY")
    .default("PREPAID"),
  paymentStatus: Joi.string()
    .valid("PENDING", "PAID", "FAILED", "REFUNDED")
    .default("PENDING"),
  deliveryMethod: Joi.string()
    .valid("HOME_DELIVERY", "PICKUP_POINT")
    .default("HOME_DELIVERY"),
  pickupPointId: Joi.string().uuid().allow(null),
  deliveryDate: Joi.date().iso().allow(null),
  notes: Joi.string().allow(null, ""),
};

const createOrderSchema = Joi.object(baseSchema);

const updateOrderSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([key, value]) => [key, value.optional()]),
  ),
);

const guestCheckoutSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one item is required",
      "any.required": "Items are required",
    }),
  guest: Joi.object({
    email: Joi.string().email().max(255).required(),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^(77|78|76|70|71|33)[0-9]{7}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Format téléphone incorrect (9 chiffres commençant avec 77, 78, 76, 70, 71, ou 33)",
      }),
  })
    .required()
    .messages({ "any.required": "Guest information is required" }),
  deliveryMethod: Joi.string()
    .valid("HOME_DELIVERY", "PICKUP_POINT")
    .required(),
  address: Joi.object({
    street: Joi.string().min(2).max(255).required(),
    city: Joi.string().min(2).max(100).required(),
    zipCode: Joi.string().min(2).max(20).required(),
    country: Joi.string().min(2).max(100).required(),
    state: Joi.string().max(100).allow(null, ""),
  })
    .when("deliveryMethod", {
      is: "HOME_DELIVERY",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.unknown": "Address is only allowed for home delivery",
    }),
  coordinates: coordinatesSchema
    .when("deliveryMethod", {
      is: "HOME_DELIVERY",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.unknown": "Current location is only allowed for home delivery",
    }),
  pickupPointId: Joi.string()
    .uuid()
    .when("deliveryMethod", {
      is: "PICKUP_POINT",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "Pickup point is required for pickup delivery",
      "any.unknown": "Pickup point is only allowed for pickup delivery",
    }),
  paymentMethod: Joi.string()
    .valid("WAVE", "ORANGE_MONEY", "BANK_CARD", "CASH")
    .required(),
  paymentTiming: Joi.string().valid("PREPAID", "ON_DELIVERY").required(),
  deliveryDate: Joi.date()
    .iso()
    .required()
    .custom((value, helpers) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        return helpers.message("Delivery date must be today or later");
      }
      return value;
    }),
  notes: Joi.string().max(500).allow(null, ""),
}).custom((value, helpers) => {
  if (value.paymentMethod === "CASH" && value.paymentTiming !== "ON_DELIVERY") {
    return helpers.message("Cash payment is only available on delivery");
  }
  // Home delivery needs exactly one target: a typed address OR current location.
  if (value.deliveryMethod === "HOME_DELIVERY") {
    const hasAddress = Boolean(value.address);
    const hasCoords = Boolean(value.coordinates);
    if (hasAddress === hasCoords) {
      return helpers.message(
        "For home delivery, provide either an address or your current location",
      );
    }
  }
  return value;
}, "guest checkout combination validation");

// Body of the public reverse-geocode endpoint: just GPS coordinates.
const reverseGeocodeSchema = coordinatesSchema.required();

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  checkoutSchema,
  guestCheckoutSchema,
  reverseGeocodeSchema,
};
