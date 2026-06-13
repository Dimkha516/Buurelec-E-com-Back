const express = require("express");
const bannerController = require("../../controllers/admin/banner.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createBannerSchema,
  updateBannerSchema,
} = require("../../validators/banner.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, isActive, currentlyActive, sortBy, sortOrder, page, limit):
router.get("/", bannerController.list);

// CREATE:
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

// DELETE (hard delete; no FK references):
router.delete("/:id", bannerController.remove);

module.exports = router;
