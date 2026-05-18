const express = require("express");
const categoryController = require("../../controllers/admin/category.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const checkUnique = require("../../utils/checkUnique");
const checkExist = require("../../utils/checkExist");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../../validators/category.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, parentId (or "root"), isActive, sortBy, sortOrder, page, limit):
router.get("/", categoryController.list);

// CREATE:
router.post(
  "/",
  validateMiddleware(createCategorySchema),
  checkUnique("category", ["slug"]),
  checkExist({ model: "category", field: "parentId" }),
  categoryController.create,
);

// GET_BY_ID_OR_SLUG:
router.get("/:id", categoryController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateCategorySchema),
  checkExist({ model: "category", field: "parentId" }),
  categoryController.update,
);

// SOFT DELETE (sets isActive=false; FK Restrict from products):
router.delete("/:id", categoryController.remove);

module.exports = router;
