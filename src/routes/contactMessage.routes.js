const express = require("express");
const contactMessageController = require("../controllers/contactMessage.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createContactMessageSchema,
  updateContactMessageSchema,
} = require("../validators/contactMessage.validator");
const router = express.Router();

// GET_ALL:
router.get("/", contactMessageController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createContactMessageSchema),
  contactMessageController.create,
);

// GET_BY_ID:
router.get("/:id", contactMessageController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateContactMessageSchema),
  contactMessageController.update,
);

// DELETE:
router.delete("/:id", contactMessageController.delete);

module.exports = router;
