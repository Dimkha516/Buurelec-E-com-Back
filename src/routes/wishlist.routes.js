const express = require("express");
const wishlistController = require("../controllers/wishlist.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { addToWishlistSchema } = require("../validators/wishlist.validator");

const router = express.Router();

router.use(authenticate);

// GET_MY_WISHLIST:
router.get("/", wishlistController.getMyWishlist);

// ADD_TO_WISHLIST:
router.post(
  "/",
  validateMiddleware(addToWishlistSchema),
  wishlistController.addToWishlist,
);

// REMOVE_FROM_WISHLIST:
router.delete("/:productId", wishlistController.removeFromWishlist);

module.exports = router;
