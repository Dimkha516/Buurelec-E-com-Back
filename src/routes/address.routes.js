const express = require("express");
const addressController = require("../controllers/address.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createAddressSchema,
  updateAddressSchema,
} = require("../validators/address.validator");
const checkExist = require("../utils/checkExist");
const router = express.Router();

// GET_ALL:
router.get("/", addressController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createAddressSchema),
  checkExist({ model: "user", field: "userId" }),
  addressController.create,
);

// GET_BY_ID:
router.get("/:id", addressController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateAddressSchema),
  addressController.update,
);

// DELETE:
router.delete("/:id", addressController.delete);

module.exports = router;
