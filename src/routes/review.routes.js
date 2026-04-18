const express = require("express");
const reviewController = require("../controllers/review.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/review.validator");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", reviewController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createReviewSchema),
  checkExistMultiple([
    { model: "product", field: "productId" },
    { model: "user", field: "userId" },
  ]),
  reviewController.create,
);

// GET_BY_ID:
router.get("/:id", reviewController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateReviewSchema),
  reviewController.update,
);

// DELETE:
router.delete("/:id", reviewController.delete);

module.exports = router;
