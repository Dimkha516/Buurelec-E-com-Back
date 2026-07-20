const express = require("express");
const orderController = require("../controllers/order.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { reverseGeocodeSchema } = require("../validators/order.validator");

const router = express.Router();

// REVERSE_GEOCODE (public — no auth required):
// Turns GPS coordinates into a normalized address so the checkout page can
// preview the delivery address before the order is placed.
router.post(
  "/reverse",
  validateMiddleware(reverseGeocodeSchema),
  orderController.reverseGeocode,
);

module.exports = router;
