const express = require("express");
const settingController = require("../../controllers/admin/setting.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { updateSettingsSchema } = require("../../validators/admin/setting.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// GET full settings (auto-creates with defaults on first read):
router.get("/", settingController.get);

// UPDATE settings (partial — send only the fields you want to change):
router.put("/", validateMiddleware(updateSettingsSchema), settingController.update);

module.exports = router;
