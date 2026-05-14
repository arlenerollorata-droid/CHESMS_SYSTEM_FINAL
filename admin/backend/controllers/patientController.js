const Patient = require("../models/patient");
const MedicalRecord = require("../models/record");
const Appointment = require("../models/appointment");

exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({ lastVisit: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkDuplicate = async (req, res) => {
    try {
        const { name, birthdate, residentId } = req.query;
        let query = {};
        
        if (residentId) {
            query.residentId = residentId;
        } else if (name && birthdate) {
            query.name = { $regex: new RegExp(`^${name}$`, 'i') };
            query.birthdate = new Date(birthdate);
        } else {
            return res.status(400).json({ message: "Missing search parameters" });
        }

        const duplicate = await Patient.findOne(query);
        res.json({ isDuplicate: !!duplicate, patient: duplicate });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addPatient = async (req, res) => {
    try {
        const patientData = { ...req.body };
        
        // 1. Advanced Duplicate Prevention
        const existing = await Patient.findOne({
            $or: [
                { residentId: patientData.residentId || 'non-existent-id' },
                { 
                    name: { $regex: new RegExp(`^${patientData.name}$`, 'i') },
                    birthdate: patientData.birthdate ? new Date(patientData.birthdate) : null
                }
            ]
        });

        if (existing) {
            return res.status(409).json({ 
                message: "A patient with this name and birthdate (or Resident ID) already exists.",
                patient: existing 
            });
        }

        // 2. ID Generation Logic
        if (!patientData.patientId) {
            const year = new Date().getFullYear();
            const count = await Patient.countDocuments();
            const sequence = (count + 1).toString().padStart(4, '0');
            patientData.patientId = `PAT-${year}-${sequence}`;
        }
        
        // 3. Date Parsing
        if (patientData.birthdate && typeof patientData.birthdate === 'string') {
            patientData.birthdate = new Date(patientData.birthdate);
        }
        
        if (patientData.lastVisit && typeof patientData.lastVisit === 'string') {
            patientData.lastVisit = new Date(patientData.lastVisit);
        } else if (!patientData.lastVisit) {
            patientData.lastVisit = new Date();
        }
        
        if (patientData.age && typeof patientData.age === 'string') {
            patientData.age = parseInt(patientData.age, 10);
        }

        // Convert prenatal data dates
        if (patientData.prenatalData) {
            if (patientData.prenatalData.dueDate && typeof patientData.prenatalData.dueDate === 'string') {
                patientData.prenatalData.dueDate = new Date(patientData.prenatalData.dueDate);
            }
            if (patientData.prenatalData.nextVisitDate && typeof patientData.prenatalData.nextVisitDate === 'string') {
                patientData.prenatalData.nextVisitDate = new Date(patientData.prenatalData.nextVisitDate);
            }
        }
        
        // Convert TB DOTS data dates
        if (patientData.tbDotsData) {
            if (patientData.tbDotsData.treatmentStartDate && typeof patientData.tbDotsData.treatmentStartDate === 'string') {
                patientData.tbDotsData.treatmentStartDate = new Date(patientData.tbDotsData.treatmentStartDate);
            }
            if (patientData.tbDotsData.nextVisitDate && typeof patientData.tbDotsData.nextVisitDate === 'string') {
                patientData.tbDotsData.nextVisitDate = new Date(patientData.tbDotsData.nextVisitDate);
            }
        }
        
        // Convert Senior data follow-up
        if (patientData.seniorData && patientData.seniorData.followUpDate && typeof patientData.seniorData.followUpDate === 'string') {
            patientData.seniorData.followUpDate = new Date(patientData.seniorData.followUpDate);
        }

        // Convert Family Planning data
        if (patientData.familyPlanningData) {
            if (patientData.familyPlanningData.nextResupplyDate && typeof patientData.familyPlanningData.nextResupplyDate === 'string') {
                patientData.familyPlanningData.nextResupplyDate = new Date(patientData.familyPlanningData.nextResupplyDate);
            }
            if (patientData.familyPlanningData.followUpDate && typeof patientData.familyPlanningData.followUpDate === 'string') {
                patientData.familyPlanningData.followUpDate = new Date(patientData.familyPlanningData.followUpDate);
            }
        }

        // Convert Immunization data
        if (patientData.immunizationData) {
            if (patientData.immunizationData.dateAdministered && typeof patientData.immunizationData.dateAdministered === 'string') {
                patientData.immunizationData.dateAdministered = new Date(patientData.immunizationData.dateAdministered);
            }
            if (patientData.immunizationData.nextDoseSchedule && typeof patientData.immunizationData.nextDoseSchedule === 'string') {
                patientData.immunizationData.nextDoseSchedule = new Date(patientData.immunizationData.nextDoseSchedule);
            }
        }

        // Convert Dental data
        if (patientData.dentalData && patientData.dentalData.nextVisit && typeof patientData.dentalData.nextVisit === 'string') {
            patientData.dentalData.nextVisit = new Date(patientData.dentalData.nextVisit);
        }

        // Convert Asthma data
        if (patientData.asthmaData && patientData.asthmaData.followUpDate && typeof patientData.asthmaData.followUpDate === 'string') {
            patientData.asthmaData.followUpDate = new Date(patientData.asthmaData.followUpDate);
        }

        // Convert Consultation data
        if (patientData.consultationData && patientData.consultationData.followUpDate && typeof patientData.consultationData.followUpDate === 'string') {
            patientData.consultationData.followUpDate = new Date(patientData.consultationData.followUpDate);
        }

        // Helper: remove empty-string or whitespace-only string fields from an object (non-recursive)
        const removeEmptyStrings = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach(k => {
                const v = obj[k];
                if (typeof v === 'string' && v.trim() === '') delete obj[k];
            });
        };

        // Sanitize pediatricData and other nested case-specific objects before constructing the model
        if (patientData.pediatricData) removeEmptyStrings(patientData.pediatricData);
        if (patientData.prenatalData) removeEmptyStrings(patientData.prenatalData);
        if (patientData.tbDotsData) removeEmptyStrings(patientData.tbDotsData);
        if (patientData.immunizationData) removeEmptyStrings(patientData.immunizationData);

        const newPatient = new Patient(patientData);
        await newPatient.save();

        // 4. Automatic Medical Record Initialization
        try {
            const CASE_TYPES = {
                opd: { id: "opd", label: "OPD", name: "General OPD" },
                tb: { id: "tb", label: "TB DOTS", name: "TB DOTS Program" },
                pediatric: { id: "pediatric", label: "Pediatric", name: "Child Care Services" },
                immunization: { id: "immunization", label: "Immunization", name: "Vaccination Programs" },
                prenatal: { id: "prenatal", label: "Prenatal", name: "Prenatal Care" },
                ncd: { id: "ncd", label: "NCD", name: "Non-Communicable Disease" },
                dental: { id: "dental", label: "Dental", name: "Dental Care" },
                familyplanning: { id: "familyplanning", label: "Family Planning", name: "Family Planning Services" },
                senior: { id: "senior", label: "Senior", name: "Senior Care Services" }
            };

            const getInitialRecords = () => ({
                consultations: [], prescriptions: [], labResults: [], immunizations: [], referrals: [],
                sputum: [], xray: [], adherence: [], treatment: [], followup: [],
                ultrasound: [], trimester: [], maternal: [], bpMonitoring: [],
                medication: [], glucose: [], complications: [], growth: [], development: []
            });

            // Map category to active case ID
            let activeCaseId = "tb"; // Default fallback
            const cat = (newPatient.category || "").toString().toLowerCase();
            if (cat === "prenatal") activeCaseId = "prenatal";
            else if (cat === "tb dots") activeCaseId = "tb";
            else if (cat === "pediatric") activeCaseId = "pediatric";
            else if (cat === "immunization") activeCaseId = "immunization";
            else if (cat === "dental") activeCaseId = "dental";
            else if (cat === "family planning") activeCaseId = "familyplanning";
            else if (cat === "hypertension") activeCaseId = "hypertension";
            else if (cat === "diabetes") activeCaseId = "diabetes";
            else if (cat === "asthma") activeCaseId = "asthma";
            else if (cat === "senior") activeCaseId = "senior";

            const metadata = CASE_TYPES[activeCaseId];
            const records = getInitialRecords();

            // Seed clinical data from newPatient into records based on active category
            if (newPatient.prenatalData && activeCaseId === 'prenatal') {
                if (newPatient.prenatalData.nextVisitDate) {
                    records.followup.push({
                        id: `FUP-INIT-${Date.now()}`,
                        date: new Date(newPatient.prenatalData.nextVisitDate).toISOString().split('T')[0],
                        notes: "Scheduled during registration"
                    });
                }
                if (newPatient.bp || newPatient.weight) {
                    records.maternal.push({
                        id: `MAT-INIT-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        bloodPressure: newPatient.bp,
                        weight: newPatient.weight,
                        height: newPatient.height,
                        gestationalAge: newPatient.prenatalData?.gestationalWeek || '',
                        notes: "Initial vitals from registration"
                    });
                }
                if (newPatient.prenatalData?.trimester) {
                    records.trimester.push({
                        id: `TRI-INIT-${Date.now()}`,
                        trimester: newPatient.prenatalData.trimester,
                        gestationalAge: newPatient.prenatalData?.gestationalWeek || '',
                        dueDate: newPatient.prenatalData?.dueDate ? new Date(newPatient.prenatalData.dueDate).toISOString().split('T')[0] : '',
                        riskLevel: newPatient.prenatalData?.riskLevel || 'Normal',
                        date: new Date().toISOString().split('T')[0],
                        notes: "Initial trimester from registration"
                    });
                }
            } else if (newPatient.pediatricData && activeCaseId === 'pediatric') {
                 records.consultations.push({
                    id: `CON-INIT-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    chiefComplaint: "Pediatric Registration",
                    notes: `Baby: ${newPatient.pediatricData.babyFullName}, Delivery: ${newPatient.pediatricData.deliveryType}`
                });
            } else if (newPatient.immunizationData && activeCaseId === 'immunization') {
                 records.immunizations.push({
                    id: `IMM-INIT-${Date.now()}`,
                    vaccineType: newPatient.immunizationData.vaccineType,
                    date: newPatient.immunizationData.dateAdministered
                });
            } else if (newPatient.dentalData && activeCaseId === 'dental') {
                 records.consultations.push({
                    id: `CON-INIT-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    chiefComplaint: newPatient.dentalData.chiefComplaint,
                    notes: newPatient.dentalData.oralExamination
                });
            } else if (newPatient.familyPlanningData && activeCaseId === 'familyplanning') {
                 records.consultations.push({
                    id: `CON-INIT-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    chiefComplaint: "Family Planning Enrollment",
                    notes: `Method: ${newPatient.familyPlanningData.methodChosen}`
                });
            } else if (newPatient.ncdData && (activeCaseId === 'hypertension' || activeCaseId === 'diabetes')) {
                 records.medication.push({
                     id: `MED-INIT-${Date.now()}`,
                     name: newPatient.ncdData.medication,
                     date: new Date().toISOString().split('T')[0]
                 });
            } else if (newPatient.asthmaData && activeCaseId === 'asthma') {
                records.consultations.push({
                    id: `CON-INIT-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    chiefComplaint: "Asthma Enrollment",
                    notes: `Severity: ${newPatient.asthmaData.severity}`
                });
            } else if (newPatient.seniorData && activeCaseId === 'senior') {
                records.consultations.push({
                    id: `CON-INIT-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    chiefComplaint: "Senior Care Enrollment",
                    notes: `Mobility: ${newPatient.seniorData.mobilityStatus}`
                });
            }

            const activeCase = {
                ...metadata,
                status: 'Active',
                isDefault: true,
                records
            };

            const getInitials = (name) => {
                return (name || '')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(part => part[0])
                    .join('')
                    .toUpperCase() || 'P';
            };

            // Helper to safely convert date to ISO string
            const toDateStr = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

            const newRecord = new MedicalRecord({
                patientId: newPatient.patientId,
                patientName: newPatient.name,
                patientAvatar: getInitials(newPatient.name),
                age: newPatient.age,
                sex: newPatient.gender,
                bloodType: newPatient.bloodType,
                civilStatus: newPatient.civilStatus,
                birthdate: newPatient.birthdate ? toDateStr(newPatient.birthdate) : null,
                address: newPatient.address,
                barangay: newPatient.barangay,
                purok: newPatient.purok,
                contact: newPatient.contact,
                bp: newPatient.bp,
                bloodSugar: newPatient.bloodSugar,
                weight: newPatient.weight,
                height: newPatient.height,
                category: metadata.label,
                lastVisit: new Date().toISOString().split('T')[0],
                emergencyContact: newPatient.emergencyContact,
                medicalHistory: newPatient.medicalHistory || [],

                // Prenatal
                prenatalData: newPatient.prenatalData ? {
                    gestationalWeek: newPatient.prenatalData.gestationalWeek,
                    trimester: newPatient.prenatalData.trimester,
                    dueDate: toDateStr(newPatient.prenatalData.dueDate),
                    riskLevel: newPatient.prenatalData.riskLevel,
                    babyInsight: newPatient.prenatalData.babyInsight,
                    progressPercent: newPatient.prenatalData.progressPercent,
                    nextVisitDate: toDateStr(newPatient.prenatalData.nextVisitDate),
                    nextVisitTime: newPatient.prenatalData.nextVisitTime,
                    nextVisitLocation: newPatient.prenatalData.nextVisitLocation
                } : undefined,

                // TB DOTS
                tbDotsData: newPatient.tbDotsData ? {
                    treatmentStartDate: toDateStr(newPatient.tbDotsData.treatmentStartDate),
                    treatmentPhase: newPatient.tbDotsData.treatmentPhase,
                    regimen: newPatient.tbDotsData.regimen,
                    adherencePercent: newPatient.tbDotsData.adherencePercent,
                    nextVisitDate: toDateStr(newPatient.tbDotsData.nextVisitDate),
                    nextVisitTime: newPatient.tbDotsData.nextVisitTime,
                    nextVisitLocation: newPatient.tbDotsData.nextVisitLocation
                } : undefined,

                // Pediatric
                pediatricData: newPatient.pediatricData ? {
                    babyFullName: newPatient.pediatricData.babyFullName,
                    timeOfBirth: newPatient.pediatricData.timeOfBirth,
                    placeOfBirth: newPatient.pediatricData.placeOfBirth,
                    birthWeight: newPatient.pediatricData.birthWeight,
                    birthLength: newPatient.pediatricData.birthLength,
                    deliveryType: newPatient.pediatricData.deliveryType,
                    birthStatus: newPatient.pediatricData.birthStatus,
                    hasComplications: newPatient.pediatricData.hasComplications,
                    complicationsNotes: newPatient.pediatricData.complicationsNotes,
                    vitaminKGiven: newPatient.pediatricData.vitaminKGiven,
                    eyeOintmentGiven: newPatient.pediatricData.eyeOintmentGiven,
                    breastfeedingStarted: newPatient.pediatricData.breastfeedingStarted,
                    newbornScreeningDone: newPatient.pediatricData.newbornScreeningDone,
                    bcgGiven: newPatient.pediatricData.bcgGiven,
                    bcgDate: toDateStr(newPatient.pediatricData.bcgDate),
                    hepaBGiven: newPatient.pediatricData.hepaBGiven,
                    hepaBDate: toDateStr(newPatient.pediatricData.hepaBDate),
                    firstCheckupDate: toDateStr(newPatient.pediatricData.firstCheckupDate),
                    assignedHealthWorker: newPatient.pediatricData.assignedHealthWorker,
                    remarks: newPatient.pediatricData.remarks,
                    guardianName: newPatient.pediatricData.guardianName,
                    guardianRelation: newPatient.pediatricData.guardianRelation,
                    guardianPhone: newPatient.pediatricData.guardianPhone,
                    immunizationStatus: newPatient.pediatricData.immunizationStatus
                } : undefined,

                // Senior
                seniorData: newPatient.seniorData ? {
                    philhealth: newPatient.seniorData.philhealth,
                    seniorCitizenId: newPatient.seniorData.seniorCitizenId,
                    pension: newPatient.seniorData.pension,
                    oscaId: newPatient.seniorData.oscaId,
                    mobilityStatus: newPatient.seniorData.mobilityStatus,
                    cognitiveAssessment: newPatient.seniorData.cognitiveAssessment,
                    visionAssessment: newPatient.seniorData.visionAssessment,
                    hearingAssessment: newPatient.seniorData.hearingAssessment,
                    medications: newPatient.seniorData.medications,
                    fallRisk: newPatient.seniorData.fallRisk,
                    caregiverInfo: newPatient.seniorData.caregiverInfo,
                    chronicConditions: newPatient.seniorData.chronicConditions,
                    vaccinations: newPatient.seniorData.vaccinations,
                    nutritionAssessment: newPatient.seniorData.nutritionAssessment,
                    mentalHealthNotes: newPatient.seniorData.mentalHealthNotes,
                    followUpDate: toDateStr(newPatient.seniorData.followUpDate)
                } : undefined,

                // NCD
                ncdData: newPatient.ncdData ? {
                    hypertensionStage: newPatient.ncdData.hypertensionStage,
                    diabetesType: newPatient.ncdData.diabetesType,
                    lastHbA1c: newPatient.ncdData.lastHbA1c,
                    lastFastingGlucose: newPatient.ncdData.lastFastingGlucose,
                    lastLDL: newPatient.ncdData.lastLDL,
                    medication: newPatient.ncdData.medication,
                    complications: newPatient.ncdData.complications
                } : undefined,

                // Family Planning
                familyPlanningData: newPatient.familyPlanningData ? {
                    methodChosen: newPatient.familyPlanningData.methodChosen,
                    previousMethod: newPatient.familyPlanningData.previousMethod,
                    pregnancyHistory: newPatient.familyPlanningData.pregnancyHistory,
                    menstrualHistory: newPatient.familyPlanningData.menstrualHistory,
                    bp: newPatient.familyPlanningData.bp,
                    weight: newPatient.familyPlanningData.weight,
                    counselingProvided: newPatient.familyPlanningData.counselingProvided,
                    sideEffects: newPatient.familyPlanningData.sideEffects,
                    nextResupplyDate: toDateStr(newPatient.familyPlanningData.nextResupplyDate),
                    followUpDate: toDateStr(newPatient.familyPlanningData.followUpDate),
                    remarks: newPatient.familyPlanningData.remarks
                } : undefined,

                // Immunization
                immunizationData: newPatient.immunizationData ? {
                    vaccineType: newPatient.immunizationData.vaccineType,
                    doseNumber: newPatient.immunizationData.doseNumber,
                    dateAdministered: toDateStr(newPatient.immunizationData.dateAdministered),
                    batchLotNumber: newPatient.immunizationData.batchLotNumber,
                    vaccinator: newPatient.immunizationData.vaccinator,
                    injectionSite: newPatient.immunizationData.injectionSite,
                    nextDoseSchedule: toDateStr(newPatient.immunizationData.nextDoseSchedule),
                    adverseReaction: newPatient.immunizationData.adverseReaction,
                    immunizationStatus: newPatient.immunizationData.immunizationStatus,
                    remarks: newPatient.immunizationData.remarks
                } : undefined,

                // Dental
                dentalData: newPatient.dentalData ? {
                    chiefComplaint: newPatient.dentalData.chiefComplaint,
                    oralExamination: newPatient.dentalData.oralExamination,
                    affectedTooth: newPatient.dentalData.affectedTooth,
                    dentalChart: newPatient.dentalData.dentalChart,
                    procedureNeeded: newPatient.dentalData.procedureNeeded,
                    prescriptions: newPatient.dentalData.prescriptions,
                    oralHygieneAdvice: newPatient.dentalData.oralHygieneAdvice,
                    nextVisit: toDateStr(newPatient.dentalData.nextVisit),
                    dentistNotes: newPatient.dentalData.dentistNotes
                } : undefined,

                // Asthma
                asthmaData: newPatient.asthmaData ? {
                    severity: newPatient.asthmaData.severity,
                    triggers: newPatient.asthmaData.triggers,
                    peakFlow: newPatient.asthmaData.peakFlow,
                    oxygenSat: newPatient.asthmaData.oxygenSat,
                    breathingAssessment: newPatient.asthmaData.breathingAssessment,
                    medications: newPatient.asthmaData.medications,
                    nebulization: newPatient.asthmaData.nebulization,
                    emergencyEpisodes: newPatient.asthmaData.emergencyEpisodes,
                    allergyHistory: newPatient.asthmaData.allergyHistory,
                    smokingExposure: newPatient.asthmaData.smokingExposure,
                    followUpDate: toDateStr(newPatient.asthmaData.followUpDate),
                    remarks: newPatient.asthmaData.remarks
                } : undefined,

                cases: [activeCase]
            });
            await newRecord.save();
            console.log(`Medical record initialized with active case (${metadata.label}) for PAT: ${newPatient.patientId}`);
        } catch (recErr) {
            console.error("Error creating initial record:", recErr);
        }

        res.status(201).json(newPatient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const existing = await Patient.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        const patientData = { ...req.body };
        if (patientData.birthdate && typeof patientData.birthdate === 'string') {
            patientData.birthdate = new Date(patientData.birthdate);
        }
        
        // Convert prenatal data dates
        if (patientData.prenatalData) {
            if (patientData.prenatalData.dueDate && typeof patientData.prenatalData.dueDate === 'string') {
                patientData.prenatalData.dueDate = new Date(patientData.prenatalData.dueDate);
            }
            if (patientData.prenatalData.nextVisitDate && typeof patientData.prenatalData.nextVisitDate === 'string') {
                patientData.prenatalData.nextVisitDate = new Date(patientData.prenatalData.nextVisitDate);
            }
        }
        
        // Convert TB DOTS data dates
        if (patientData.tbDotsData) {
            if (patientData.tbDotsData.treatmentStartDate && typeof patientData.tbDotsData.treatmentStartDate === 'string') {
                patientData.tbDotsData.treatmentStartDate = new Date(patientData.tbDotsData.treatmentStartDate);
            }
            if (patientData.tbDotsData.nextVisitDate && typeof patientData.tbDotsData.nextVisitDate === 'string') {
                patientData.tbDotsData.nextVisitDate = new Date(patientData.tbDotsData.nextVisitDate);
            }
        }
        
        // Helper (re-used) to remove empty-string fields
        const removeEmptyStrings = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach(k => {
                const v = obj[k];
                if (typeof v === 'string' && v.trim() === '') delete obj[k];
            });
        };

        // Sanitize incoming nested structures to avoid enum validation failures
        if (patientData.pediatricData) removeEmptyStrings(patientData.pediatricData);
        if (patientData.prenatalData) removeEmptyStrings(patientData.prenatalData);
        if (patientData.tbDotsData) removeEmptyStrings(patientData.tbDotsData);
        if (patientData.immunizationData) removeEmptyStrings(patientData.immunizationData);
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            patientData,
            { new: true, runValidators: true }
        );
        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const pId = patient.patientId;
        const pName = patient.name;
        const mongoId = req.params.id;

        // 1. Delete the Patient document
        await Patient.findByIdAndDelete(mongoId);

        // 2. Delete associated MedicalRecord document(s)
        if (pId) {
            await MedicalRecord.deleteMany({ patientId: pId });
        } else if (pName) {
            await MedicalRecord.deleteMany({ patientName: pName });
        }

        // 3. Delete associated Appointment(s)
        // Check by both ObjectId reference and name fallback
        await Appointment.deleteMany({
            $or: [
                { patient: mongoId },
                { patientName: pName }
            ]
        });

        res.json({ 
            message: "Patient, medical records, and appointments have been permanently removed.",
            deletedId: pId
        });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Failed to fully delete record: " + err.message });
    }
};

/**
 * Get patient profile by ID with all category-specific data
 */
exports.getPatientProfile = async (req, res) => {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            return res.status(400).json({ message: "patientId is required" });
        }

        // Try to find by patientId string first, then by MongoDB ID
        let patient = await Patient.findOne({ patientId }).lean();
        if (!patient) {
            patient = await Patient.findById(patientId).lean();
        }

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({
            success: true,
            patient: {
                _id: patient._id,
                patientId: patient.patientId,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                bloodType: patient.bloodType,
                birthdate: patient.birthdate,
                civilStatus: patient.civilStatus,
                address: patient.address,
                barangay: patient.barangay,
                purok: patient.purok,
                contact: patient.contact,
                category: patient.category,
                bp: patient.bp,
                bloodSugar: patient.bloodSugar,
                weight: patient.weight,
                height: patient.height,
                lastVisit: patient.lastVisit,
                status: patient.status,
                
                // Medical history
                medicalHistory: patient.medicalHistory || [],
                allergies: patient.allergies || [],
                surgeries: patient.surgeries || [],
                medications: patient.medications || [],
                emergencyContact: patient.emergencyContact,
                
                // Category-specific data
                prenatalData: patient.prenatalData || {},
                tbDotsData: patient.tbDotsData || {},
                pediatricData: patient.pediatricData || {},
                seniorData: patient.seniorData || {},
                ncdData: patient.ncdData || {},
                familyPlanningData: patient.familyPlanningData || {}
            }
        });
    } catch (err) {
        console.error("Error in getPatientProfile:", err);
        res.status(500).json({ message: err.message });
    }
};