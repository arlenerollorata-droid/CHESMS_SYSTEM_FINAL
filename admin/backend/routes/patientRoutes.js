const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// Get all patients
router.get("/", patientController.getPatients);

// Get patient profile by ID with category-specific data
router.get("/profile/by-id", patientController.getPatientProfile);

// Check for duplicate patient
router.get("/check-duplicate", patientController.checkDuplicate);

// Add patient
router.post("/add", patientController.addPatient);

// Update patient
router.put("/:id", patientController.updatePatient);

// Delete patient
router.delete("/:id", patientController.deletePatient);

module.exports = router;
