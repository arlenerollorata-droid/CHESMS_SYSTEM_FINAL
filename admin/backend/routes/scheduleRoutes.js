const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.get("/", scheduleController.getSchedules);
router.get("/patient/:patientId", scheduleController.getSchedulesByPatient);
router.post("/", scheduleController.createSchedule);
router.patch("/:id/status", scheduleController.updateStatus);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
