const express = require("express");
const productFeatureController = require("../controllers/productFeature.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createProductFeatureSchema,
  updateProductFeatureSchema,
} = require("../validators/productFeature.validator");
const checkExist = require("../utils/checkExist");
const router = express.Router();

// GET_ALL:
router.get("/", productFeatureController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createProductFeatureSchema),
  checkExist({ model: "product", field: "productId" }),
  productFeatureController.create,
);

// GET_BY_ID:
router.get("/:id", productFeatureController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateProductFeatureSchema),
  productFeatureController.update,
);

// DELETE:
router.delete("/:id", productFeatureController.delete);

module.exports = router;
