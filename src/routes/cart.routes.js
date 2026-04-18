const express = require("express");
const cartController = require("../controllers/cart.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createCartSchema,
  updateCartSchema,
} = require("../validators/cart.validator");
const checkExist = require("../utils/checkExist");
const checkUnique = require("../utils/checkUnique");
const router = express.Router();

// GET_ALL:
router.get("/", cartController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createCartSchema),
  checkExist({ model: "user", field: "userId" }),
  checkUnique("cart", ["userId"]),
  cartController.create,
);

// GET_BY_ID:
router.get("/:id", cartController.getOne);

// UPDATE:
router.put("/:id", validateMiddleware(updateCartSchema), cartController.update);

// DELETE:
router.delete("/:id", cartController.delete);

module.exports = router;
