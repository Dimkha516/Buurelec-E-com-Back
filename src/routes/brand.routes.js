const express = require("express");
const brandController = require("../controllers/brand.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createBrandSchema,
  updateBrandSchema,
} = require("../validators/brand.validator");
const checkUnique = require("../utils/checkUnique");
const router = express.Router();

// GET_ALL:
router.get("/", brandController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createBrandSchema),
  checkUnique("brand", ["name", "slug"]),
  brandController.create,
);

// GET_BY_ID:
router.get("/:id", brandController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateBrandSchema),
  brandController.update,
);

// DELETE:
router.delete("/:id", brandController.delete);

module.exports = router;
