const express = require("express");
const orderController = require("../controllers/order.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createOrderSchema,
  updateOrderSchema,
} = require("../validators/order.validator");
const checkUnique = require("../utils/checkUnique");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", orderController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createOrderSchema),
  checkUnique("order", ["orderNumber"]),
  checkExistMultiple([
    { model: "user", field: "userId" },
    { model: "address", field: "shippingAddressId" },
    { model: "address", field: "billingAddressId" },
  ]),
  orderController.create,
);

// GET_BY_ID:
router.get("/:id", orderController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateOrderSchema),
  orderController.update,
);

// DELETE:
router.delete("/:id", orderController.delete);

module.exports = router;
