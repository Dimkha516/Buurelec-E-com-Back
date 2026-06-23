const express = require("express");
const settingController = require("../controllers/setting.controller");

const router = express.Router();

// Public read: curated subset for the frontend (header, footer, contact page).
router.get("/", settingController.get);

module.exports = router;
