const express = require("express");
const userController = require("../../controllers/admin/user.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const checkUnique = require("../../utils/checkUnique");
const {
  createAdminUserSchema,
  updateAdminUserSchema,
} = require("../../validators/admin/user.validator");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// LIST (filters: search, role, isActive, emailVerified, sortBy, sortOrder, page, limit):
router.get("/", userController.list);

// CREATE:
router.post(
  "/",
  validateMiddleware(createAdminUserSchema),
  checkUnique("user", ["email"]),
  userController.create,
);

// GET_BY_ID:
router.get("/:id", userController.getOne);

// UPDATE (also revokes sessions if password changed or user deactivated):
router.put(
  "/:id",
  validateMiddleware(updateAdminUserSchema),
  userController.update,
);

// SOFT DELETE (isActive=false + revoke refresh tokens):
router.delete("/:id", userController.remove);

module.exports = router;
