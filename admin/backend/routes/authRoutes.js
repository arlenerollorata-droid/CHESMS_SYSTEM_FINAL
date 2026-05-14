const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.post("/change-password", authController.changePassword);

module.exports = router;
