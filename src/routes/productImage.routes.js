const express = require("express");
const productImageController = require("../controllers/productImage.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createProductImageSchema,
  updateProductImageSchema,
} = require("../validators/productImage.validator");
const checkExist = require("../utils/checkExist");
const router = express.Router();

// GET_ALL:
router.get("/", productImageController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createProductImageSchema),
  checkExist({ model: "product", field: "productId" }),
  productImageController.create,
);

// GET_BY_ID:
router.get("/:id", productImageController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateProductImageSchema),
  productImageController.update,
);

// DELETE:
router.delete("/:id", productImageController.delete);

module.exports = router;
