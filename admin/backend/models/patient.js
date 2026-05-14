const mongoose = require("mongoose");

const MedicalConditionSchema = new mongoose.Schema({
    condition: { type: String },
    diagnosedDate: Date,
    notes: String,
    status: { type: String, enum: ['Active', 'Resolved', 'Ongoing'], default: 'Active' }
}, { _id: true });

const AllergySchema = new mongoose.Schema({
    allergen: { type: String },
    reaction: String,
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Moderate' }
}, { _id: true });

const SurgerySchema = new mongoose.Schema({
    procedure: { type: String },
    date: Date,
    hospital: String,
    notes: String
}, { _id: true });

const MedicationSchema = new mongoose.Schema({
    name: { type: String },
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    status: { type: String, enum: ['Active', 'Discontinued'], default: 'Active' }
}, { _id: true });

const PrenatalVisitSchema = new mongoose.Schema({
    date: Date,
    time: String,
    week: String,
    staff: String,
    notes: String
}, { _id: true });

const MedicationLogSchema = new mongoose.Schema({
    date: Date,
    medicine: String,
    taken: { type: Boolean, default: true },
    remarks: String
}, { _id: true });

const PediatricDataSchema = new mongoose.Schema({
    babyFullName: String,
    timeOfBirth: String,
    placeOfBirth: { type: String, enum: ['Home', 'Hospital', 'Lying-in clinic'] },
    birthWeight: String,
    birthLength: String,
    deliveryType: { type: String, enum: ['Normal (NSD)', 'Cesarean (CS)', 'Assisted'] },
    birthStatus: { type: String, enum: ['Alive at birth', 'Stillbirth'] },
    hasComplications: { type: String, enum: ['No', 'Yes'], default: 'No' },
    complicationsNotes: String,
    vitaminKGiven: { type: String, enum: ['Yes', 'No'] },
    eyeOintmentGiven: { type: String, enum: ['Yes', 'No'] },
    breastfeedingStarted: { type: String, enum: ['Yes', 'No'] },
    newbornScreeningDone: { type: String, enum: ['Yes', 'No', 'Planned'] },
    bcgGiven: { type: String, enum: ['Yes', 'No'] },
    bcgDate: Date,
    hepaBGiven: { type: String, enum: ['Yes', 'No'] },
    hepaBDate: Date,
    firstCheckupDate: Date,
    assignedHealthWorker: String,
    remarks: String,
    school: String,
    grade: String,
    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    immunizationStatus: {
        type: String,
        enum: ['Complete', 'Partial', 'Not Started', 'Overdue'],
        default: 'Complete',
        set: v => (typeof v === 'string' && v.trim() === '') ? undefined : v
    }
}, { _id: true });

// FIX: Added philhealth, seniorCitizenId, pension, oscaId to match form fields
const SeniorDataSchema = new mongoose.Schema({
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
    followUpDate: Date
}, { _id: false });

const NCDDataSchema = new mongoose.Schema({
    hypertensionStage: { type: String, enum: ['Normal', 'Elevated', 'Stage 1 Hypertension', 'Stage 2 Hypertension', 'Hypertensive Crisis'], default: 'Normal' },
    diabetesType: { type: String, enum: ['Type 1', 'Type 2', 'Gestational', 'Pre-diabetic'], default: 'Type 2' },
    lastHbA1c: String,
    lastFastingGlucose: String,
    lastLDL: String,
    medication: String,
    complications: String
}, { _id: true });

// FIX: Aligned with actual form field names (methodChosen, previousMethod, bp, weight, etc.)
const FamilyPlanningDataSchema = new mongoose.Schema({
    methodChosen: String,
    previousMethod: String,
    pregnancyHistory: String,
    menstrualHistory: String,
    bp: String,
    weight: String,
    counselingProvided: [String],
    sideEffects: [String],
    nextResupplyDate: Date,
    followUpDate: Date,
    remarks: String
}, { _id: false });

const ImmunizationDataSchema = new mongoose.Schema({
    vaccineType: String,
    doseNumber: String,
    dateAdministered: Date,
    batchLotNumber: String,
    vaccinator: String,
    injectionSite: String,
    nextDoseSchedule: Date,
    adverseReaction: [String],
    immunizationStatus: String,
    remarks: String
}, { _id: false });

const DentalDataSchema = new mongoose.Schema({
    chiefComplaint: String,
    oralExamination: String,
    affectedTooth: String,
    dentalChart: String,
    procedureNeeded: [String],
    prescriptions: [String],
    oralHygieneAdvice: String,
    nextVisit: Date,
    dentistNotes: String
}, { _id: false });

const AsthmaDataSchema = new mongoose.Schema({
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
    followUpDate: Date,
    remarks: String
}, { _id: false });

const GeneralConsultationSchema = new mongoose.Schema({
    chiefComplaint: String,
    symptoms: [String],
    vitalSigns: String,
    physicalExam: String,
    initialAssessment: String,
    diagnosis: String,
    prescriptions: [String],
    labRequests: [String],
    adviceGiven: String,
    referral: String,
    followUpDate: Date
}, { _id: false });

const PatientSchema = new mongoose.Schema({
    patientId: { type: String, unique: true },
    name: { type: String, required: true },
    birthdate: Date,
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    civilStatus: { type: String, enum: ['Single', 'Married', 'Widowed', 'Separated'], default: 'Single' },
    address: String,
    barangay: String,
    purok: String,
    contact: String,
    category: String,
    bp: String,
    bloodSugar: String,
    weight: String,
    height: String,
    lastVisit: Date,
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
    medicalHistory: [MedicalConditionSchema],
    allergies: [AllergySchema],
    surgeries: [SurgerySchema],
    medications: [MedicationSchema],
    prenatalData: {
        gestationalWeek: Number,
        trimester: { type: String, enum: ['1st Trimester', '2nd Trimester', '3rd Trimester'] },
        dueDate: Date,
        riskLevel: { type: String, enum: ['Low Risk', 'Moderate Risk', 'High Risk'], default: 'Low Risk' },
        babyInsight: String,
        progressPercent: Number,
        nextVisitDate: Date,
        nextVisitTime: String,
        nextVisitLocation: String,
        visitHistory: [PrenatalVisitSchema]
    },
    tbDotsData: {
        treatmentStartDate: Date,
        treatmentPhase: { type: String, enum: ['Intensive', 'Continuation'], default: 'Intensive' },
        regimen: String,
        adherencePercent: Number,
        nextVisitDate: Date,
        nextVisitTime: String,
        nextVisitLocation: String,
        visitHistory: [PrenatalVisitSchema],
        medicationLogs: [MedicationLogSchema]
    },
    pediatricData: PediatricDataSchema,
    seniorData: SeniorDataSchema,
    ncdData: NCDDataSchema,
    familyPlanningData: FamilyPlanningDataSchema,
    immunizationData: ImmunizationDataSchema,
    dentalData: DentalDataSchema,
    asthmaData: AsthmaDataSchema,
    consultationData: GeneralConsultationSchema,
    status: { type: String, enum: ['Active', 'Inactive', 'Transferred', 'Deceased'], default: 'Active' }
}, { timestamps: true });

// Pre-validate hook to coerce empty-string enum fields to undefined
PatientSchema.pre('validate', function() {
    console.log('Pre-validate hook executing for patient:', this.name);
    try {
        if (this.pediatricData && typeof this.pediatricData.immunizationStatus === 'string' && this.pediatricData.immunizationStatus.trim() === '') {
            this.pediatricData.immunizationStatus = undefined;
        }
        if (this.immunizationData && typeof this.immunizationData.immunizationStatus === 'string' && this.immunizationData.immunizationStatus.trim() === '') {
            this.immunizationData.immunizationStatus = undefined;
        }
    } catch (e) {
        // ignore
    }
});

module.exports = mongoose.model("Patient", PatientSchema);
