const express = require("express");
const orderItemController = require("../controllers/orderItem.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createOrderItemSchema,
  updateOrderItemSchema,
} = require("../validators/orderItem.validator");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", orderItemController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createOrderItemSchema),
  checkExistMultiple([
    { model: "order", field: "orderId" },
    { model: "product", field: "productId" },
  ]),
  orderItemController.create,
);

// GET_BY_ID:
router.get("/:id", orderItemController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateOrderItemSchema),
  orderItemController.update,
);

// DELETE:
router.delete("/:id", orderItemController.delete);

module.exports = router;
