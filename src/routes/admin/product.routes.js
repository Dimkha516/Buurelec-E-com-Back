const express = require("express");
const productController = require("../../controllers/admin/product.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const checkUnique = require("../../utils/checkUnique");
const checkExistMultiple = require("../../utils/checkExistMultiple");
const {
  createProductSchema,
  updateProductSchema,
} = require("../../validators/product.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (with filters: search, categoryId, brandId, badge, isActive, isFeatured, inStock, sortBy, sortOrder, page, limit):
router.get("/", productController.list);

// CREATE:
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

// GET_BY_ID_OR_SLUG:
router.get("/:id", productController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateProductSchema),
  checkExistMultiple([
    { model: "category", field: "categoryId" },
    { model: "brand", field: "brandId" },
  ]),
  productController.update,
);

// SOFT DELETE (sets isActive=false):
router.delete("/:id", productController.remove);

module.exports = router;
