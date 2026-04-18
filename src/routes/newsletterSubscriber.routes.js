const express = require("express");
const newsletterSubscriberController = require("../controllers/newsletterSubscriber.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const {
  createNewsletterSubscriberSchema,
  updateNewsletterSubscriberSchema,
} = require("../validators/newsletterSubscriber.validator");
const checkUnique = require("../utils/checkUnique");
const router = express.Router();

// GET_ALL:
router.get("/", newsletterSubscriberController.getAll);

// POST:
router.post(
  "/",
  validateMiddleware(createNewsletterSubscriberSchema),
  checkUnique("newsletterSubscriber", ["email"]),
  newsletterSubscriberController.create,
);

// GET_BY_ID:
router.get("/:id", newsletterSubscriberController.getOne);

// UPDATE:
router.put(
  "/:id",
  validateMiddleware(updateNewsletterSubscriberSchema),
  newsletterSubscriberController.update,
);

// DELETE:
router.delete("/:id", newsletterSubscriberController.delete);

module.exports = router;
