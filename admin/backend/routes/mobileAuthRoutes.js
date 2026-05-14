const express = require("express");
const router = express.Router();
const mobileAuthController = require("../controllers/mobileAuthController");

router.post("/register", mobileAuthController.register);
router.post("/login", mobileAuthController.login);

module.exports = router;