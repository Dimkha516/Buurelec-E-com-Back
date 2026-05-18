const express = require("express");
const pickupPointController = require("../../controllers/admin/pickupPoint.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createPickupPointSchema,
  updatePickupPointSchema,
} = require("../../validators/pickupPoint.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, city, isActive, sortBy, sortOrder, page, limit):
router.get("/", pickupPointController.list);

// CREATE:
router.post(
  "/",
  validateMiddleware(createPickupPointSchema),
  pickupPointController.create,
);

// GET_BY_ID:
router.get("/:id", pickupPointController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updatePickupPointSchema),
  pickupPointController.update,
);

// SOFT DELETE (sets isActive=false):
router.delete("/:id", pickupPointController.remove);

module.exports = router;
