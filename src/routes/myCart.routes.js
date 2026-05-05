const express = require("express");
const cartController = require("../controllers/cart.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { addToCartSchema } = require("../validators/cart.validator");

const router = express.Router();

router.use(authenticate);

// GET_MY_CART:
router.get("/", cartController.getMyCart);

// GET_CART_SUMMARY (totals + per-product details for checkout review):
router.get("/summary", cartController.getCartSummary);

// ADD_TO_CART:
router.post(
  "/items",
  validateMiddleware(addToCartSchema),
  cartController.addToCart,
);

// REMOVE_FROM_CART:
router.delete("/items/:productId", cartController.removeFromCart);

module.exports = router;
