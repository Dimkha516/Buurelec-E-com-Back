const express = require("express");
const dealController = require("../../controllers/admin/deal.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createDealSchema,
  updateDealSchema,
} = require("../../validators/deal.validator");
const {
  addDealProductSchema,
  updateDealProductSchema,
} = require("../../validators/admin/deal.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// ===== Deal CRUD =====

// LIST (filters: search, isActive, currentlyActive, sortBy, sortOrder, page, limit):
router.get("/", dealController.list);

// CREATE:
router.post("/", validateMiddleware(createDealSchema), dealController.create);

// GET_BY_ID (with full products list):
router.get("/:id", dealController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateDealSchema),
  dealController.update,
);

// DELETE (hard delete; cascades to DealProduct rows):
router.delete("/:id", dealController.remove);

// ===== Deal Products (nested) =====

// ADD product to deal:
router.post(
  "/:id/products",
  validateMiddleware(addDealProductSchema),
  dealController.addProduct,
);

// UPDATE deal price for a product:
router.put(
  "/:id/products/:productId",
  validateMiddleware(updateDealProductSchema),
  dealController.updateProduct,
);

// REMOVE product from deal:
router.delete("/:id/products/:productId", dealController.removeProduct);

module.exports = router;
