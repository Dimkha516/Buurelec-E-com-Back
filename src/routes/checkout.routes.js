const express = require("express");
const orderController = require("../controllers/order.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { guestCheckoutSchema } = require("../validators/order.validator");

const router = express.Router();

// GUEST_CHECKOUT (public — no auth required):
router.post(
  "/guest",
  validateMiddleware(guestCheckoutSchema),
  orderController.guestCheckout,
);

module.exports = router;
