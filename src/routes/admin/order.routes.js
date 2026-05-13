const express = require("express");
const orderController = require("../../controllers/admin/order.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST_ORDERS:
router.get("/", orderController.list);

// GET_ORDER_BY_ID:
router.get("/:id", orderController.getOne);

// VALIDATE (PENDING -> CONFIRMED) + email customer:
router.post("/:id/confirm", orderController.confirm);

// CONFIRMED -> PROCESSING:
router.post("/:id/process", orderController.process);

// PROCESSING -> SHIPPED (sets shippedAt) + email customer:
router.post("/:id/ship", orderController.ship);

// SHIPPED -> DELIVERED (sets deliveredAt) + email customer:
router.post("/:id/deliver", orderController.deliver);

module.exports = router;
