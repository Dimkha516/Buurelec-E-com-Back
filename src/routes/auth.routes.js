const express = require("express");
const authController = require("../controllers/auth.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  validateMiddleware(registerSchema),
  authController.register,
);
router.post("/login", validateMiddleware(loginSchema), authController.login);
router.post(
  "/refresh",
  validateMiddleware(refreshSchema),
  authController.refresh,
);
router.post("/logout", authController.logout);

module.exports = router;
