const express = require("express");
const userController = require("../controllers/user.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validators/user.validator");
const checkUnique = require("../utils/checkUnique");
const { authenticate } = require("../middlewares/auth.middleware");
const router = express.Router();

// GET_MY_PROFILE (must be declared before /:id):
router.get("/me", authenticate, userController.getMe);

// GET_ALL:
router.get("/", userController.getAll);
// POST:
router.post(
  "/",
  validateMiddleware(createUserSchema),
  checkUnique("user", ["email"]),
  userController.create,
);

// GET_BY_ID:
router.get("/:id", userController.getOne);

// UPDATE:
router.put("/:id", validateMiddleware(updateUserSchema), userController.update);

// DELETE:
router.delete("/:id", userController.delete);

module.exports = router;
