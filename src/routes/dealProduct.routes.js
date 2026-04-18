const express = require("express");
const dealProductController = require("../controllers/dealProduct.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createDealProductSchema,
  updateDealProductSchema,
} = require("../validators/dealProduct.validator");
const checkExistMultiple = require("../utils/checkExistMultiple");
const router = express.Router();

// GET_ALL:
router.get("/", dealProductController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createDealProductSchema),
  checkExistMultiple([
    { model: "deal", field: "dealId" },
    { model: "product", field: "productId" },
  ]),
  dealProductController.create,
);

// GET_BY_ID:
router.get("/:id", dealProductController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateDealProductSchema),
  dealProductController.update,
);

// DELETE:
router.delete("/:id", dealProductController.delete);

module.exports = router;
