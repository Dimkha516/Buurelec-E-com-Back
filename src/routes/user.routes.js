const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();

// GET_ALL:
router.get("/", userController.getAll);

// POST:

// GET_BY_ID:

// UPDATE:

// DELETE:

module.exports = router;