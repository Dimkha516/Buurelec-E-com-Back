const express = require("express");
const bannerController = require("../controllers/banner.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createBannerSchema,
  updateBannerSchema,
} = require("../validators/banner.validator");
const router = express.Router();

// GET_ALL:
router.get("/", bannerController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createBannerSchema),
  bannerController.create,
);

// GET_BY_ID:
router.get("/:id", bannerController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateBannerSchema),
  bannerController.update,
);

// DELETE:
router.delete("/:id", bannerController.delete);

module.exports = router;
