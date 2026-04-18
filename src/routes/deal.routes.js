const express = require("express");
const dealController = require("../controllers/deal.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createDealSchema,
  updateDealSchema,
} = require("../validators/deal.validator");
const router = express.Router();

// GET_ALL:
router.get("/", dealController.getAll);

// POST:
router.post("/", validateMiddleware(createDealSchema), dealController.create);

// GET_BY_ID:
router.get("/:id", dealController.getOne);

// UPDATE:
router.put("/:id", validateMiddleware(updateDealSchema), dealController.update);

// DELETE:
router.delete("/:id", dealController.delete);

module.exports = router;
