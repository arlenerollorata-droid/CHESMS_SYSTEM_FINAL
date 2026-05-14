const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");

console.log("Loading recordRoutes...");

// --- Specific non-parameterized routes MUST come before /:patientId ---
router.get("/", recordController.getRecords);
router.post("/add", recordController.addRecord);
router.post("/create-initial", recordController.createInitialRecord);
router.get("/category-history/profile", (req, res) => {
  console.log("Category route handler called!");
  recordController.getCategoryMedicalHistory(req, res);
});

// --- Sub-resource routes (still before bare /:patientId GET) ---
router.post("/:patientId/consultations", recordController.addConsultation);
router.post("/:patientId/prescriptions", recordController.addPrescription);
router.post("/:patientId/lab-results", recordController.addLabResult);
router.post("/:patientId/immunizations", recordController.addImmunization);
router.post("/:patientId/referrals", recordController.addReferral);

router.delete("/:patientId/consultations/:consultationId", recordController.deleteConsultation);
router.delete("/:patientId/prescriptions/:prescriptionId", recordController.deletePrescription);
router.delete("/:patientId/lab-results/:labResultId", recordController.deleteLabResult);
router.delete("/:patientId/immunizations/:immunizationId", recordController.deleteImmunization);
router.delete("/:patientId/cases/:caseId", recordController.deleteCase);

// --- Generic /:patientId routes LAST ---
router.get("/:patientId", recordController.getRecordByPatientId);
router.put("/:patientId", recordController.updateRecord);
router.put("/:patientId/cases", recordController.updateCases);
router.delete("/:patientId", recordController.deleteRecord);

module.exports = router;
