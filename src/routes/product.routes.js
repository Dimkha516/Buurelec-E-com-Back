const express = require("express");
const productController = require("../controllers/product.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/product.validator");
const checkUnique = require("../utils/checkUnique");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", productController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createProductSchema),
  checkUnique("product", ["slug", "sku"]),
  checkExistMultiple([
    { model: "category", field: "categoryId" },
    { model: "brand", field: "brandId" },
  ]),
  productController.create,
);

// GET_BY_ID:
router.get("/:id", productController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateProductSchema),
  productController.update,
);

// DELETE:
router.delete("/:id", productController.delete);

module.exports = router;
