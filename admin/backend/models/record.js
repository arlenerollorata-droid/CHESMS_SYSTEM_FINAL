const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema({
  date: String,
  time: String,
  chiefComplaint: String,
  diagnosis: String,
  treatment: String,
  notes: String,
  bloodPressure: String,
  temperature: String,
  weight: String,
  pulseRate: String,
  gestationalAge: String,
  trimester: String
});

const PrescriptionSchema = new mongoose.Schema({
  medicine: String,
  dosage: String,
  frequency: String,
  duration: String,
  datePrescribed: String,
  notes: String
});

const LabResultSchema = new mongoose.Schema({
  testName: String,
  result: String,
  normalRange: String,
  dateOfTest: String,
  remarks: String,
  notes: String
});

const ImmunizationSchema = new mongoose.Schema({
  vaccineName: String,
  dateGiven: String,
  nextDueDate: String,
  notes: String
});

const ReferralSchema = new mongoose.Schema({
  referredTo: String,
  reason: String,
  date: String,
  status: String
});

const MedicalConditionSchema = new mongoose.Schema({
  condition: { type: String },
  diagnosedDate: Date,
  notes: String,
  status: { type: String, enum: ['Active', 'Resolved', 'Ongoing'], default: 'Active' }
}, { _id: true });

const EmergencyContactSchema = new mongoose.Schema({
  name: String,
  relation: String,
  phone: String
}, { _id: false });

const RecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  patientName: String,
  patientAvatar: String,
  age: Number,
  sex: String,
  bloodType: String,
  address: String,
  barangay: String,
  purok: String,
  contact: String,
  civilStatus: String,
  birthdate: String,
  bloodSugar: String,
  bp: String,
  weight: String,
  height: String,
  category: { type: String, default: 'OPD' },
  lastVisit: String,
  knownConditions: String,
  allergies: String,
  emergencyContact: EmergencyContactSchema,
  medicalHistory: [MedicalConditionSchema],

  // Prenatal-specific
  prenatalData: {
    gestationalWeek: Number,
    trimester: String,
    dueDate: String,
    riskLevel: String,
    babyInsight: String,
    progressPercent: Number,
    nextVisitDate: String,
    nextVisitTime: String,
    nextVisitLocation: String
  },

  // TB DOTS-specific
  tbDotsData: {
    treatmentStartDate: String,
    treatmentPhase: String,
    regimen: String,
    adherencePercent: Number,
    nextVisitDate: String,
    nextVisitTime: String,
    nextVisitLocation: String
  },

  // Pediatric-specific
  pediatricData: {
    babyFullName: String,
    timeOfBirth: String,
    placeOfBirth: String,
    birthWeight: String,
    birthLength: String,
    deliveryType: String,
    birthStatus: String,
    hasComplications: String,
    complicationsNotes: String,
    vitaminKGiven: String,
    eyeOintmentGiven: String,
    breastfeedingStarted: String,
    newbornScreeningDone: String,
    bcgGiven: String,
    bcgDate: String,
    hepaBGiven: String,
    hepaBDate: String,
    firstCheckupDate: String,
    assignedHealthWorker: String,
    remarks: String,
    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    immunizationStatus: String
  },

  // Senior-specific
  seniorData: {
    philhealth: String,
    seniorCitizenId: String,
    pension: String,
    oscaId: String,
    mobilityStatus: String,
    cognitiveAssessment: String,
    visionAssessment: String,
    hearingAssessment: String,
    medications: [String],
    fallRisk: String,
    caregiverInfo: String,
    chronicConditions: [String],
    vaccinations: [String],
    nutritionAssessment: String,
    mentalHealthNotes: String,
    followUpDate: String
  },

  // NCD-specific
  ncdData: {
    hypertensionStage: String,
    diabetesType: String,
    lastHbA1c: String,
    lastFastingGlucose: String,
    lastLDL: String,
    medication: String,
    complications: String
  },

  // Family Planning-specific
  familyPlanningData: {
    methodChosen: String,
    previousMethod: String,
    pregnancyHistory: String,
    menstrualHistory: String,
    bp: String,
    weight: String,
    counselingProvided: [String],
    sideEffects: [String],
    nextResupplyDate: String,
    followUpDate: String,
    remarks: String
  },

  // Immunization-specific
  immunizationData: {
    vaccineType: String,
    doseNumber: String,
    dateAdministered: String,
    batchLotNumber: String,
    vaccinator: String,
    injectionSite: String,
    nextDoseSchedule: String,
    adverseReaction: [String],
    immunizationStatus: String,
    remarks: String
  },

  // Dental-specific
  dentalData: {
    chiefComplaint: String,
    oralExamination: String,
    affectedTooth: String,
    dentalChart: String,
    procedureNeeded: [String],
    prescriptions: [String],
    oralHygieneAdvice: String,
    nextVisit: String,
    dentistNotes: String
  },

  // Asthma-specific
  asthmaData: {
    severity: String,
    triggers: [String],
    peakFlow: String,
    oxygenSat: String,
    breathingAssessment: String,
    medications: [String],
    nebulization: String,
    emergencyEpisodes: Number,
    allergyHistory: String,
    smokingExposure: String,
    followUpDate: String,
    remarks: String
  },

  cases: { type: [mongoose.Schema.Types.Mixed], default: [] },
  consultations: [ConsultationSchema],
  prescriptions: [PrescriptionSchema],
  labResults: [LabResultSchema],
  immunizations: [ImmunizationSchema],
  referrals: [ReferralSchema]
}, { timestamps: true });

module.exports = mongoose.model("MedicalRecord", RecordSchema);
