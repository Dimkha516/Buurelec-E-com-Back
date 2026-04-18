const express = require("express");
const cartItemController = require("../controllers/cartItem.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createCartItemSchema,
  updateCartItemSchema,
} = require("../validators/cartItem.validator");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", cartItemController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createCartItemSchema),
  checkExistMultiple([
    { model: "cart", field: "cartId" },
    { model: "product", field: "productId" },
  ]),
  cartItemController.create,
);

// GET_BY_ID:
router.get("/:id", cartItemController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateCartItemSchema),
  cartItemController.update,
);

// DELETE:
router.delete("/:id", cartItemController.delete);

module.exports = router;
