const express = require("express");
const wishlistItemController = require("../controllers/wishlistItem.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createWishlistItemSchema,
  updateWishlistItemSchema,
} = require("../validators/wishlistItem.validator");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", wishlistItemController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createWishlistItemSchema),
  checkExistMultiple([
    { model: "user", field: "userId" },
    { model: "product", field: "productId" },
  ]),
  wishlistItemController.create,
);

// GET_BY_ID:
router.get("/:id", wishlistItemController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateWishlistItemSchema),
  wishlistItemController.update,
);

// DELETE:
router.delete("/:id", wishlistItemController.delete);

module.exports = router;
