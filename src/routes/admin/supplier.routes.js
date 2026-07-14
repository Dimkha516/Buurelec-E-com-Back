const express = require("express");
const supplierController = require("../../controllers/admin/supplier.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const checkUnique = require("../../utils/checkUnique");
const {
  createSupplierSchema,
  updateSupplierSchema,
} = require("../../validators/admin/supplier.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, city, country, isActive, sortBy, sortOrder, page, limit):
router.get("/", supplierController.list);

// CREATE:
router.post(
  "/",
  validateMiddleware(createSupplierSchema),
  checkUnique("supplier", ["name"]),
  supplierController.create,
);

// GET_BY_ID:
router.get("/:id", supplierController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateSupplierSchema),
  supplierController.update,
);

// DELETE (auto-reassigns products to "Casual"; Casual itself is protected):
router.delete("/:id", supplierController.remove);

module.exports = router;
