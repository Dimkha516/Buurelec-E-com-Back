const express = require("express");
const pickupPointController = require("../controllers/pickupPoint.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createPickupPointSchema,
  updatePickupPointSchema,
} = require("../validators/pickupPoint.validator");

const router = express.Router();

// GET_ALL (public — users need this to choose a pickup point):
router.get("/", pickupPointController.getAll);

// GET_BY_ID:
router.get("/:id", pickupPointController.getOne);

// POST:
router.post(
  "/",
  validateMiddleware(createPickupPointSchema),
  pickupPointController.create,
);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updatePickupPointSchema),
  pickupPointController.update,
);

// DELETE:
router.delete("/:id", pickupPointController.delete);

module.exports = router;
