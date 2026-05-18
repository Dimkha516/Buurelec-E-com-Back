const express = require("express");
const brandController = require("../../controllers/admin/brand.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const checkUnique = require("../../utils/checkUnique");
const {
  createBrandSchema,
  updateBrandSchema,
} = require("../../validators/brand.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, isActive, sortBy, sortOrder, page, limit):
router.get("/", brandController.list);

// CREATE:
router.post(
  "/",
  validateMiddleware(createBrandSchema),
  checkUnique("brand", ["name", "slug"]),
  brandController.create,
);

// GET_BY_ID_OR_SLUG:
router.get("/:id", brandController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateBrandSchema),
  brandController.update,
);

// DELETE (hard delete; sets brandId=null on related products):
router.delete("/:id", brandController.remove);

module.exports = router;
