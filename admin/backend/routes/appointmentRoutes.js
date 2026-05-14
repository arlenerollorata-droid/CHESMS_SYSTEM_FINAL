const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

router.get("/", appointmentController.getAppointments);
router.post("/add", appointmentController.addAppointment);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;