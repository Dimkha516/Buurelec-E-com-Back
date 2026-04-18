const express = require("express");
const categoryController = require("../controllers/category.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");
const checkUnique = require("../utils/checkUnique");
const checkExist = require("../utils/checkExist");
const router = express.Router();

// GET_ALL:
router.get("/", categoryController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createCategorySchema),
  checkUnique("category", ["slug"]),
  checkExist({ model: "category", field: "parentId" }),
  categoryController.create,
);

// GET_BY_ID:
router.get("/:id", categoryController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateCategorySchema),
  categoryController.update,
);

// DELETE:
router.delete("/:id", categoryController.delete);

module.exports = router;
