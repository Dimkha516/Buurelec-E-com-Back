const express = require("express");
const orderController = require("../controllers/order.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { checkoutSchema } = require("../validators/order.validator");

const router = express.Router();

router.use(authenticate);

// CHECKOUT (creates an order from the user's cart):
router.post(
  "/checkout",
  validateMiddleware(checkoutSchema),
  orderController.checkout,
);

// LIST_MY_ORDERS:
router.get("/", orderController.getMyOrders);

// GET_MY_ORDER_BY_ID:
router.get("/:id", orderController.getMyOrder);

// CANCEL_MY_ORDER:
router.post("/:id/cancel", orderController.cancelOrder);

module.exports = router;
