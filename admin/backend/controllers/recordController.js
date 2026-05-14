const MedicalRecord = require("../models/record");
const Patient = require("../models/patient");

const CASE_TYPES = {
  tb: { id: "tb", label: "TB DOTS", name: "TB DOTS Program" },
  pediatric: { id: "pediatric", label: "Pediatric", name: "Child Care Services" },
  immunization: { id: "immunization", label: "Immunization", name: "Vaccination Programs" },
  prenatal: { id: "prenatal", label: "Prenatal", name: "Prenatal Care" },
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

const normalizeCaseId = (rawId) => {
  const value = (rawId || "tb").toString().trim().toLowerCase();
  if (value === "tb dots" || value === "tb-dots" || value === "tuberculosis" || value === "tb") return "tb";
  if (value === "pediatric" || value === "child care" || value === "childcare" || value === "pediatrics") return "pediatric";
  if (value === "immunization" || value === "vaccination") return "immunization";
  if (value === "family planning" || value === "familyplanning") return "familyplanning";
  if (value === "prenatal") return "prenatal";
  if (value === "dental") return "dental";
  if (value === "senior") return "senior";
  return value;
};

const getCaseMetadata = (caseId) => {
  const normalizedId = normalizeCaseId(caseId);
  return CASE_TYPES[normalizedId] || { id: normalizedId, label: normalizedId.toUpperCase(), name: normalizedId.toUpperCase() };
};

const isCaseEmpty = (caseItem) => {
  const records = caseItem?.records || {};
  return Object.values(records).every((value) => !Array.isArray(value) || value.length === 0);
};

const findCaseIndexById = (cases = [], caseId) => {
  const normalizedTarget = normalizeCaseId(caseId);
  return cases.findIndex((c) => normalizeCaseId(c.id) === normalizedTarget);
};

const normalizeCategoryToCase = (rawCategory) => {
  const value = (rawCategory || "TB DOTS").toString().trim().toLowerCase();

  if (value === "prenatal") return CASE_TYPES.prenatal;
  if (value === "tb" || value === "tb dots" || value === "tuberculosis" || value === "tb-dots") return CASE_TYPES.tb;
  if (value === "pediatric" || value === "child care" || value === "childcare" || value === "pediatrics") return CASE_TYPES.pediatric;
  if (value === "immunization" || value === "vaccination") return CASE_TYPES.immunization;
  if (value === "dental") return CASE_TYPES.dental;
  if (value === "family planning" || value === "familyplanning") return CASE_TYPES.familyplanning;
  if (value === "senior") return CASE_TYPES.senior;

  return CASE_TYPES.tb;
};

const createSingleCase = (caseId, status = 'Active', patient = null) => {
  const metadata = getCaseMetadata(caseId);
  const records = getInitialRecords();

  // Auto-seed prenatal data if applicable
  if (normalizeCaseId(caseId) === 'prenatal' && patient) {
    if (patient.bp || patient.weight || patient.height) {
      records.maternal.push({
        id: `MAT-INIT-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        bloodPressure: patient.bp,
        weight: patient.weight,
        height: patient.height,
        gestationalAge: patient.prenatalData?.gestationalWeek || '',
        notes: "Initial vitals from registration"
      });
    }
    if (patient.prenatalData?.trimester) {
      records.trimester.push({
        id: `TRI-INIT-${Date.now()}`,
        trimester: patient.prenatalData.trimester,
        gestationalAge: patient.prenatalData?.gestationalWeek || '',
        dueDate: patient.prenatalData?.dueDate ? new Date(patient.prenatalData.dueDate).toISOString().split('T')[0] : '',
        riskLevel: patient.prenatalData?.riskLevel || 'Normal',
        date: new Date().toISOString().split('T')[0],
        notes: "Initial trimester from registration"
      });
    }
    if (patient.prenatalData?.nextVisitDate) {
      records.followup.push({
        id: `FUP-INIT-${Date.now()}`,
        date: new Date(patient.prenatalData.nextVisitDate).toISOString().split('T')[0],
        notes: "Scheduled during registration"
      });
    }
  }

  return {
    ...metadata,
    status,
    isDefault: status === 'Active',
    records
  };
};

const syncPatientDataToRecord = (record, patient) => {
  if (!patient) return record;

  const toDateStr = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

  // Core fields
  record.patientName = patient.name || record.patientName;
  record.age = patient.age || record.age;
  record.sex = patient.gender || record.sex;
  record.civilStatus = patient.civilStatus || record.civilStatus;
  record.birthdate = patient.birthdate ? toDateStr(patient.birthdate) : record.birthdate;
  record.address = patient.address || record.address;
  record.barangay = patient.barangay || record.barangay;
  record.purok = patient.purok || record.purok;
  record.contact = patient.contact || record.contact;
  record.bloodType = patient.bloodType || record.bloodType;
  record.bp = patient.bp || record.bp;
  record.bloodSugar = patient.bloodSugar || record.bloodSugar;
  record.weight = patient.weight || record.weight;
  record.height = patient.height || record.height;
  record.emergencyContact = patient.emergencyContact || record.emergencyContact;
  record.medicalHistory = Array.isArray(patient.medicalHistory) ? patient.medicalHistory : record.medicalHistory;

  // Prenatal
  if (patient.prenatalData) {
    record.prenatalData = {
      gestationalWeek: patient.prenatalData.gestationalWeek,
      trimester: patient.prenatalData.trimester,
      dueDate: toDateStr(patient.prenatalData.dueDate),
      riskLevel: patient.prenatalData.riskLevel,
      babyInsight: patient.prenatalData.babyInsight,
      progressPercent: patient.prenatalData.progressPercent,
      nextVisitDate: toDateStr(patient.prenatalData.nextVisitDate),
      nextVisitTime: patient.prenatalData.nextVisitTime,
      nextVisitLocation: patient.prenatalData.nextVisitLocation
    };
    // Also seed into the prenatal case records
    const prenatalIdx = record.cases.findIndex(c => normalizeCaseId(c.id) === 'prenatal');
    if (prenatalIdx !== -1) {
      const records = record.cases[prenatalIdx].records;
      if (records.maternal.length === 0 && (patient.bp || patient.weight)) {
        records.maternal.push({
          id: `MAT-SYNC-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          bloodPressure: patient.bp,
          weight: patient.weight,
          height: patient.height,
          gestationalAge: patient.prenatalData?.gestationalWeek || '',
          notes: "Synced from registration"
        });
      }
      if (records.trimester.length === 0 && patient.prenatalData.trimester) {
        records.trimester.push({
          id: `TRI-SYNC-${Date.now()}`,
          trimester: patient.prenatalData.trimester,
          gestationalAge: patient.prenatalData.gestationalWeek || '',
          dueDate: toDateStr(patient.prenatalData.dueDate) || '',
          riskLevel: patient.prenatalData.riskLevel || 'Normal',
          date: new Date().toISOString().split('T')[0],
          notes: "Synced from registration"
        });
      }
    }
  }

  // TB DOTS
  if (patient.tbDotsData) {
    record.tbDotsData = {
      treatmentStartDate: toDateStr(patient.tbDotsData.treatmentStartDate),
      treatmentPhase: patient.tbDotsData.treatmentPhase,
      regimen: patient.tbDotsData.regimen,
      adherencePercent: patient.tbDotsData.adherencePercent,
      nextVisitDate: toDateStr(patient.tbDotsData.nextVisitDate),
      nextVisitTime: patient.tbDotsData.nextVisitTime,
      nextVisitLocation: patient.tbDotsData.nextVisitLocation
    };
  }

  // Pediatric
  if (patient.pediatricData) {
    record.pediatricData = {
      babyFullName: patient.pediatricData.babyFullName,
      timeOfBirth: patient.pediatricData.timeOfBirth,
      placeOfBirth: patient.pediatricData.placeOfBirth,
      birthWeight: patient.pediatricData.birthWeight,
      birthLength: patient.pediatricData.birthLength,
      deliveryType: patient.pediatricData.deliveryType,
      birthStatus: patient.pediatricData.birthStatus,
      hasComplications: patient.pediatricData.hasComplications,
      complicationsNotes: patient.pediatricData.complicationsNotes,
      vitaminKGiven: patient.pediatricData.vitaminKGiven,
      eyeOintmentGiven: patient.pediatricData.eyeOintmentGiven,
      breastfeedingStarted: patient.pediatricData.breastfeedingStarted,
      newbornScreeningDone: patient.pediatricData.newbornScreeningDone,
      bcgGiven: patient.pediatricData.bcgGiven,
      bcgDate: toDateStr(patient.pediatricData.bcgDate),
      hepaBGiven: patient.pediatricData.hepaBGiven,
      hepaBDate: toDateStr(patient.pediatricData.hepaBDate),
      firstCheckupDate: toDateStr(patient.pediatricData.firstCheckupDate),
      assignedHealthWorker: patient.pediatricData.assignedHealthWorker,
      remarks: patient.pediatricData.remarks,
      guardianName: patient.pediatricData.guardianName,
      guardianRelation: patient.pediatricData.guardianRelation,
      guardianPhone: patient.pediatricData.guardianPhone,
      immunizationStatus: patient.pediatricData.immunizationStatus
    };
  }

  // Senior
  if (patient.seniorData) {
    record.seniorData = {
      philhealth: patient.seniorData.philhealth,
      seniorCitizenId: patient.seniorData.seniorCitizenId,
      pension: patient.seniorData.pension,
      oscaId: patient.seniorData.oscaId,
      mobilityStatus: patient.seniorData.mobilityStatus,
      cognitiveAssessment: patient.seniorData.cognitiveAssessment,
      visionAssessment: patient.seniorData.visionAssessment,
      hearingAssessment: patient.seniorData.hearingAssessment,
      medications: patient.seniorData.medications,
      fallRisk: patient.seniorData.fallRisk,
      caregiverInfo: patient.seniorData.caregiverInfo,
      chronicConditions: patient.seniorData.chronicConditions,
      vaccinations: patient.seniorData.vaccinations,
      nutritionAssessment: patient.seniorData.nutritionAssessment,
      mentalHealthNotes: patient.seniorData.mentalHealthNotes,
      followUpDate: toDateStr(patient.seniorData.followUpDate)
    };
  }

  // NCD
  if (patient.ncdData) {
    record.ncdData = {
      hypertensionStage: patient.ncdData.hypertensionStage,
      diabetesType: patient.ncdData.diabetesType,
      lastHbA1c: patient.ncdData.lastHbA1c,
      lastFastingGlucose: patient.ncdData.lastFastingGlucose,
      lastLDL: patient.ncdData.lastLDL,
      medication: patient.ncdData.medication,
      complications: patient.ncdData.complications
    };
  }

  // Family Planning
  if (patient.familyPlanningData) {
    record.familyPlanningData = {
      methodChosen: patient.familyPlanningData.methodChosen,
      previousMethod: patient.familyPlanningData.previousMethod,
      pregnancyHistory: patient.familyPlanningData.pregnancyHistory,
      menstrualHistory: patient.familyPlanningData.menstrualHistory,
      bp: patient.familyPlanningData.bp,
      weight: patient.familyPlanningData.weight,
      counselingProvided: patient.familyPlanningData.counselingProvided,
      sideEffects: patient.familyPlanningData.sideEffects,
      nextResupplyDate: toDateStr(patient.familyPlanningData.nextResupplyDate),
      followUpDate: toDateStr(patient.familyPlanningData.followUpDate),
      remarks: patient.familyPlanningData.remarks
    };
  }

  // Immunization
  if (patient.immunizationData) {
    record.immunizationData = {
      vaccineType: patient.immunizationData.vaccineType,
      doseNumber: patient.immunizationData.doseNumber,
      dateAdministered: toDateStr(patient.immunizationData.dateAdministered),
      batchLotNumber: patient.immunizationData.batchLotNumber,
      vaccinator: patient.immunizationData.vaccinator,
      injectionSite: patient.immunizationData.injectionSite,
      nextDoseSchedule: toDateStr(patient.immunizationData.nextDoseSchedule),
      adverseReaction: patient.immunizationData.adverseReaction,
      immunizationStatus: patient.immunizationData.immunizationStatus,
      remarks: patient.immunizationData.remarks
    };
  }

  // Dental
  if (patient.dentalData) {
    record.dentalData = {
      chiefComplaint: patient.dentalData.chiefComplaint,
      oralExamination: patient.dentalData.oralExamination,
      affectedTooth: patient.dentalData.affectedTooth,
      dentalChart: patient.dentalData.dentalChart,
      procedureNeeded: patient.dentalData.procedureNeeded,
      prescriptions: patient.dentalData.prescriptions,
      oralHygieneAdvice: patient.dentalData.oralHygieneAdvice,
      nextVisit: toDateStr(patient.dentalData.nextVisit),
      dentistNotes: patient.dentalData.dentistNotes
    };
  }

  // Asthma
  if (patient.asthmaData) {
    record.asthmaData = {
      severity: patient.asthmaData.severity,
      triggers: patient.asthmaData.triggers,
      peakFlow: patient.asthmaData.peakFlow,
      oxygenSat: patient.asthmaData.oxygenSat,
      breathingAssessment: patient.asthmaData.breathingAssessment,
      medications: patient.asthmaData.medications,
      nebulization: patient.asthmaData.nebulization,
      emergencyEpisodes: patient.asthmaData.emergencyEpisodes,
      allergyHistory: patient.asthmaData.allergyHistory,
      smokingExposure: patient.asthmaData.smokingExposure,
      followUpDate: toDateStr(patient.asthmaData.followUpDate),
      remarks: patient.asthmaData.remarks
    };
  }

  return record;
};

exports.ensureInitialRecord = async (req, res) => {
  try {
    const { patientId, patientName, age, sex, category, address, contact, bloodType, lastVisit } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const patient = await Patient.findOne({ patientId });

    const resolvedPatientName = patientName || patient?.name || "";
    const resolvedCategory = category || patient?.category || "OPD";
    const resolvedAge = age ?? patient?.age ?? 0;
    const resolvedSex = sex || patient?.gender || "Unknown";
    const resolvedAddress = address || patient?.address || "";
    const resolvedContact = contact || patient?.contact || "";
    const resolvedBloodType = bloodType || patient?.bloodType || "Unknown";
    const resolvedLastVisit =
      lastVisit ||
      (patient?.lastVisit ? new Date(patient.lastVisit).toISOString().split("T")[0] : null) ||
      new Date().toISOString().split("T")[0];

    const mappedCase = normalizeCategoryToCase(resolvedCategory);

    console.log("Ensuring medical record for:", resolvedPatientName || patientId, "Active Category:", mappedCase.label);

    const existing = await MedicalRecord.findOne({ patientId });
    
    if (existing) {
      let changed = true;

      syncPatientDataToRecord(existing, patient);

      if (!Array.isArray(existing.cases) || existing.cases.length === 0) {
        existing.cases = [createSingleCase(mappedCase.id, 'Active', patient)];
        existing.category = mappedCase.label;
      } else {
        // 1. Deduplicate and normalize existing cases
        const seen = new Set();
        const uniqueCases = [];
        existing.cases.forEach(c => {
          const id = normalizeCaseId(c.id);
          if (!seen.has(id)) {
            seen.add(id);
            uniqueCases.push({ ...c, id });
          }
        });
        
        existing.cases = uniqueCases;

        // 2. Ensure active case is correct
        const activeIdx = existing.cases.findIndex(c => c.status === 'Active');
        const targetIdx = existing.cases.findIndex(c => normalizeCaseId(c.id) === mappedCase.id);

        if (targetIdx !== -1 && targetIdx !== activeIdx) {
          // Set current active to previous
          if (activeIdx !== -1) {
            existing.cases[activeIdx].status = 'Previous';
            existing.cases[activeIdx].isDefault = false;
          }
          // Set new target to active
          existing.cases[targetIdx].status = 'Active';
          existing.cases[targetIdx].isDefault = true;
          existing.category = mappedCase.label;
          
          // Reorder: Active first
          const activeCase = existing.cases.splice(targetIdx, 1)[0];
          existing.cases.unshift(activeCase);
        } else if (targetIdx === -1) {
          // If the specified category case doesn't exist at all, add it as active
          if (activeIdx !== -1) {
            existing.cases[activeIdx].status = 'Previous';
            existing.cases[activeIdx].isDefault = false;
          }
          const newActiveCase = createSingleCase(mappedCase.id, 'Active', patient);
          existing.cases.unshift(newActiveCase);
          existing.category = mappedCase.label;
        }
      }

      if (changed) {
        existing.markModified('cases');
        existing.markModified('prenatalData');
        existing.markModified('tbDotsData');
        existing.markModified('pediatricData');
        existing.markModified('seniorData');
        existing.markModified('ncdData');
        existing.markModified('familyPlanningData');
        existing.markModified('immunizationData');
        existing.markModified('dentalData');
        existing.markModified('asthmaData');
        await existing.save();
      }

      return res.status(200).json(existing);
    }

    // Create new record with ONLY the active case
    const newRecord = new MedicalRecord({
      patientId,
      patientName: resolvedPatientName,
      age: resolvedAge,
      sex: resolvedSex,
      category: mappedCase.label,
      address: resolvedAddress,
      contact: resolvedContact,
      bloodType: resolvedBloodType,
      emergencyContact: patient?.emergencyContact,
      medicalHistory: patient?.medicalHistory || [],
      lastVisit: resolvedLastVisit,
      cases: [createSingleCase(mappedCase.id, 'Active', patient)]
    });

    if (patient) {
      syncPatientDataToRecord(newRecord, patient);
    }

    const savedRecord = await newRecord.save();
    console.log("Successfully created/ensured record for:", savedRecord.patientName);
    res.status(201).json(savedRecord);
  } catch (err) {
    console.error("Error in ensureInitialRecord:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.createInitialRecord = exports.ensureInitialRecord;

exports.getRecords = async (req, res) => {
  console.log(`GET /api/records hit. Query: ${JSON.stringify(req.query)}`);
  try {
    const { search, category, dateFrom, dateTo } = req.query;
    
    // 1. Get all patients to ensure we're showing everyone
    let patientQuery = {};
    let andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Handle UI Category to Model Category mapping
    if (category && category !== 'All') {
      if (category === 'General') {
        andConditions.push({
          $or: [
            { category: 'OPD' },
            { category: 'Consultation' },
            { category: { $exists: false } }
          ]
        });
      } else if (category === 'NCD') {
        andConditions.push({
          $or: [
            { category: 'NCD' },
            { category: 'Hypertension' },
            { category: 'Diabetes' },
            { category: 'Asthma' }
          ]
        });
      } else {
        andConditions.push({ category: category });
      }
    }

    if (andConditions.length > 0) {
      patientQuery.$and = andConditions;
    }

    const allPatients = await Patient.find(patientQuery);
    console.log(`Found ${allPatients.length} total patients in DB matching query`);

    // 2. Get all existing medical records
    let recordQuery = {};
    let recordAndConditions = [];

    if (search) {
      recordAndConditions.push({
        $or: [
          { patientName: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } }
        ]
      });
    }
    if (category && category !== 'All') {
      if (category === 'General') {
        recordAndConditions.push({ category: 'OPD' });
      } else {
        recordAndConditions.push({ category: category });
      }
    }

    if (recordAndConditions.length > 0) {
      recordQuery.$and = recordAndConditions;
    }
    const existingRecords = await MedicalRecord.find(recordQuery);
    console.log(`Found ${existingRecords.length} existing medical records`);
    
    // Create a map for quick lookup
    const recordMap = new Map();
    existingRecords.forEach(r => recordMap.set(r.patientId, r));

    // 3. Merge: If a patient doesn't have a record, create a "virtual" one or auto-initialize
    const finalRecords = [];
    
    for (const patient of allPatients) {
      if (recordMap.has(patient.patientId)) {
        finalRecords.push(recordMap.get(patient.patientId));
      } else {
        console.log(`Auto-initializing record for patient: ${patient.name} (${patient.patientId})`);
        // Auto-initialize missing record (Lazy Creation)
        try {
          const mappedCase = normalizeCategoryToCase(patient.category);
          
          const newRecord = new MedicalRecord({
            patientId: patient.patientId,
            patientName: patient.name,
            patientAvatar: (patient.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P',
            age: patient.age,
            sex: patient.gender,
            bloodType: patient.bloodType,
            address: patient.address,
            contact: patient.contact,
            emergencyContact: patient.emergencyContact,
            medicalHistory: patient.medicalHistory || [],
            category: mappedCase.label,
            lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            cases: createAllCases(mappedCase.id, patient)
          });
          
          const saved = await newRecord.save();
          finalRecords.push(saved);
          console.log(`Successfully created record for: ${patient.name}`);
        } catch (err) {
          console.error(`Failed to lazy-initialize record for ${patient.name}:`, err);
          // Fallback: push a plain object if save fails (rare)
          finalRecords.push({
            patientId: patient.patientId,
            patientName: patient.name,
            category: patient.category,
            isVirtual: true
          });
        }
      }
    }

    // Sort final list
    finalRecords.sort((a, b) => {
      const dateA = new Date(a.lastVisit || 0);
      const dateB = new Date(b.lastVisit || 0);
      return dateB - dateA;
    });

    res.json(finalRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecordByPatientId = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.params.patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { patientId } = req.body;
    
    // Check if record already exists
    const existingRecord = await MedicalRecord.findOne({ patientId });
    if (existingRecord) {
      return res.status(200).json(existingRecord);
    }

    const newRecord = new MedicalRecord(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const updated = await MedicalRecord.findOneAndUpdate(
      { patientId: req.params.patientId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCases = async (req, res) => {
  try {
    const { cases: incomingCases } = req.body;
    const { patientId } = req.params;

    const record = await MedicalRecord.findOne({ patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (!Array.isArray(record.cases)) record.cases = [];

    // Normalize incomingCases to array if it's a single object
    const casesToProcess = Array.isArray(incomingCases) ? incomingCases : [incomingCases];

    casesToProcess.forEach(incomingCase => {
      const normalizedId = normalizeCaseId(incomingCase.id);
      const metadata = getCaseMetadata(normalizedId);
      
      const existingIdx = record.cases.findIndex(c => normalizeCaseId(c.id) === normalizedId);

      if (existingIdx !== -1) {
        // Merge records and update metadata
        const existingCase = record.cases[existingIdx];
        record.cases[existingIdx] = {
          ...existingCase,
          ...incomingCase,
          ...metadata, // Ensure standardized name/label
          id: normalizedId,
          records: {
            ...(existingCase.records || {}),
            ...(incomingCase.records || {})
          }
        };
      } else {
        // Add new case
        record.cases.push({
          records: getInitialRecords(),
          ...incomingCase,
          ...metadata,
          id: normalizedId,
          status: incomingCase.status || 'Previous'
        });
      }
    });

    // Post-processing:
    // 1. Ensure only one active case
    const activeCases = record.cases.filter(c => c.status === 'Active');
    const newlyActiveCase = casesToProcess.find(c => c.status === 'Active');

    if (newlyActiveCase || activeCases.length > 1) {
      const targetActiveId = newlyActiveCase ? normalizeCaseId(newlyActiveCase.id) : normalizeCaseId(activeCases[0].id);
      
      record.cases.forEach(c => {
        if (normalizeCaseId(c.id) === targetActiveId) {
          c.status = 'Active';
          c.isDefault = true;
        } else {
          c.status = 'Previous';
          c.isDefault = false;
        }
      });
    }

    let activeCase = record.cases.find(c => c.status === 'Active');
    if (!activeCase && record.cases.length > 0) {
      record.cases[0].status = 'Active';
      record.cases[0].isDefault = true;
      activeCase = record.cases[0];
    }

    // 2. Reorder: Active first
    const activeIdx = record.cases.findIndex(c => c.status === 'Active');
    if (activeIdx > 0) {
      const active = record.cases.splice(activeIdx, 1)[0];
      record.cases.unshift(active);
    }

    // 3. Update Category
    if (activeCase) {
      record.category = activeCase.label;
      // Also update Patient model
      await Patient.findOneAndUpdate({ patientId }, { category: activeCase.label });
    }

    record.markModified('cases');
    await record.save();

    res.json(record);
  } catch (err) {
    console.error("Error in updateCases:", err);
    res.status(400).json({ message: err.message });
  }
};

const addRecordToCase = async (patientId, caseType, recordType, recordData, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (!Array.isArray(record.cases)) record.cases = [];
    
    const activeCase = record.cases.find(c => c.status === 'Active');
    const effectiveCaseType = normalizeCaseId(caseType || activeCase?.id || 'opd');
    let caseIndex = findCaseIndexById(record.cases, effectiveCaseType);

    if (caseIndex === -1) {
      const metadata = getCaseMetadata(effectiveCaseType);
      record.cases.push({
        ...metadata,
        status: record.cases.length === 0 ? 'Active' : 'Previous',
        isDefault: record.cases.length === 0,
        records: getInitialRecords()
      });
      caseIndex = record.cases.length - 1;
    }

    const targetCase = JSON.parse(JSON.stringify(record.cases[caseIndex]));
    if (!targetCase.records) targetCase.records = getInitialRecords();
    
    // Ensure all record arrays exist
    const initial = getInitialRecords();
    Object.keys(initial).forEach(key => {
      if (!targetCase.records[key]) targetCase.records[key] = [];
    });
    
    targetCase.records[recordType].unshift(recordData);

    record.cases.splice(caseIndex, 1, targetCase);
    record.markModified('cases');
    await record.save();
    
    return res.status(201).json(record);
  } catch (err) {
    console.error(`Error adding ${recordType}:`, err);
    return res.status(400).json({ message: err.message });
  }
};

exports.addConsultation = async (req, res) => {
  try {
    const { caseType, ...consultationData } = req.body;
    const { patientId } = req.params;
    
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    const consultation = {
      id: `CON-${Date.now()}`,
      time: consultationData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...consultationData
    };
    
    if (!record.cases) record.cases = [];
    
    // Determine target case
    const activeCase = record.cases.find(c => c.status === 'Active');
    const effectiveCaseType = normalizeCaseId(caseType || activeCase?.id || 'opd');
    let caseIndex = findCaseIndexById(record.cases, effectiveCaseType);
    
    if (caseIndex === -1) {
      const metadata = getCaseMetadata(effectiveCaseType);
      record.cases.push({
        ...metadata,
        status: record.cases.length === 0 ? 'Active' : 'Previous',
        isDefault: record.cases.length === 0,
        records: getInitialRecords()
      });
      caseIndex = record.cases.length - 1;
    }

    // Create a deep copy to ensure Mongoose detects changes in Mixed type
    const targetCase = JSON.parse(JSON.stringify(record.cases[caseIndex]));
    if (!targetCase.records) targetCase.records = getInitialRecords();
    
    // Ensure all possible record arrays exist
    const initial = getInitialRecords();
    Object.keys(initial).forEach(key => {
      if (!targetCase.records[key]) targetCase.records[key] = [];
    });
    
    targetCase.records.consultations.unshift(consultation);

    // Auto-update maternal vitals and trimester for prenatal cases
    if (effectiveCaseType === 'prenatal') {
      const records = targetCase.records;
      
      if (consultationData.bloodPressure || consultationData.weight || consultationData.temperature || consultationData.pulseRate || consultationData.gestationalAge) {
        const previousMaternal = records.maternal && records.maternal.length > 0 ? records.maternal[0] : {};
        records.maternal.unshift({
          id: `MAT-${Date.now()}`,
          date: consultationData.date || new Date().toISOString().split('T')[0],
          time: consultation.time,
          bloodPressure: consultationData.bloodPressure || previousMaternal.bloodPressure || '',
          weight: consultationData.weight || previousMaternal.weight || '',
          temperature: consultationData.temperature || previousMaternal.temperature || '',
          pulseRate: consultationData.pulseRate || previousMaternal.pulseRate || '',
          gestationalAge: consultationData.gestationalAge || consultationData.weeksPregnant || previousMaternal.gestationalAge || '',
          height: consultationData.height || previousMaternal.height || '',
          notes: `Auto-updated from consultation on ${consultationData.date || new Date().toISOString().split('T')[0]}`
        });
      }

      if (consultationData.trimester || consultationData.gestationalAge) {
        const previousTrimester = records.trimester && records.trimester.length > 0 ? records.trimester[0] : {};
        records.trimester.unshift({
          id: `TRI-${Date.now()}`,
          trimester: consultationData.trimester || previousTrimester.trimester || '1st Trimester',
          date: consultationData.date || new Date().toISOString().split('T')[0],
          gestationalAge: consultationData.gestationalAge || consultationData.weeksPregnant || previousTrimester.gestationalAge || '',
          dueDate: consultationData.dueDate || previousTrimester.dueDate || '',
          riskLevel: consultationData.riskLevel || previousTrimester.riskLevel || 'Normal',
          notes: `Auto-updated from consultation on ${consultationData.date || new Date().toISOString().split('T')[0]}`
        });
      }
    }

    record.cases.splice(caseIndex, 1, targetCase);
    record.markModified('cases');
    
    record.lastVisit = consultationData.date || new Date().toISOString().split('T')[0];
    await record.save();
    
    res.status(201).json(record);
  } catch (err) {
    console.error("Error in addConsultation:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.addPrescription = async (req, res) => {
  const { caseType, ...data } = req.body;
  return addRecordToCase(req.params.patientId, caseType, 'prescriptions', { id: `PRE-${Date.now()}`, ...data }, res);
};

exports.addLabResult = async (req, res) => {
  const { caseType, ...data } = req.body;
  return addRecordToCase(req.params.patientId, caseType, 'labResults', { id: `LAB-${Date.now()}`, ...data }, res);
};

exports.addImmunization = async (req, res) => {
  const { caseType, ...data } = req.body;
  return addRecordToCase(req.params.patientId, caseType, 'immunizations', { id: `IMM-${Date.now()}`, ...data }, res);
};

exports.addReferral = async (req, res) => {
  const { caseType, ...data } = req.body;
  const referral = {
    id: `REF-${Date.now()}`,
    date: data.date,
    referredTo: data.referredTo,
    reason: data.reason,
    status: data.status || 'Pending',
    notes: data.notes || ''
  };
  return addRecordToCase(req.params.patientId, caseType, 'referrals', referral, res);
};

exports.deleteConsultation = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.params.patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    // Delete from top-level
    if (record.consultations) {
      record.consultations = record.consultations.filter(c => c.id !== req.params.consultationId && c._id?.toString() !== req.params.consultationId);
    }

    // Delete from all cases
    if (record.cases && Array.isArray(record.cases)) {
      record.cases.forEach(c => {
        if (c.records && c.records.consultations) {
          c.records.consultations = c.records.consultations.filter(con => con.id !== req.params.consultationId && con._id?.toString() !== req.params.consultationId);
        }
      });
      record.markModified('cases');
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.params.patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    if (record.prescriptions) {
      record.prescriptions = record.prescriptions.filter(p => p.id !== req.params.prescriptionId && p._id?.toString() !== req.params.prescriptionId);
    }

    if (record.cases && Array.isArray(record.cases)) {
      record.cases.forEach(c => {
        if (c.records && c.records.prescriptions) {
          c.records.prescriptions = c.records.prescriptions.filter(p => p.id !== req.params.prescriptionId && p._id?.toString() !== req.params.prescriptionId);
        }
      });
      record.markModified('cases');
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLabResult = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.params.patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    if (record.labResults) {
      record.labResults = record.labResults.filter(l => l.id !== req.params.labResultId && l._id?.toString() !== req.params.labResultId);
    }

    if (record.cases && Array.isArray(record.cases)) {
      record.cases.forEach(c => {
        if (c.records && c.records.labResults) {
          c.records.labResults = c.records.labResults.filter(l => l.id !== req.params.labResultId && l._id?.toString() !== req.params.labResultId);
        }
      });
      record.markModified('cases');
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteImmunization = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patientId: req.params.patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    if (record.immunizations) {
      record.immunizations = record.immunizations.filter(i => i.id !== req.params.immunizationId && i._id?.toString() !== req.params.immunizationId);
    }

    if (record.cases && Array.isArray(record.cases)) {
      record.cases.forEach(c => {
        if (c.records && c.records.immunizations) {
          c.records.immunizations = c.records.immunizations.filter(i => i.id !== req.params.immunizationId && i._id?.toString() !== req.params.immunizationId);
        }
      });
      record.markModified('cases');
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const { patientId, caseId } = req.params;
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (!Array.isArray(record.cases)) {
      return res.status(200).json(record);
    }

    // Don't allow deleting the default OPD case if it's the only one
    if (caseId === 'opd' && record.cases.length === 1) {
      return res.status(400).json({ message: "Cannot delete the only remaining case" });
    }

    const caseToDelete = record.cases.find(c => normalizeCaseId(c.id) === normalizeCaseId(caseId));
    if (!caseToDelete) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Filter out the case
    record.cases = record.cases.filter(c => normalizeCaseId(c.id) !== normalizeCaseId(caseId));

    // If we deleted the active case, make the first remaining case active
    if (caseToDelete.status === 'Active' && record.cases.length > 0) {
      record.cases[0].status = 'Active';
      record.cases[0].isDefault = true;
      record.category = record.cases[0].label;
      
      // Update Patient model too
      await Patient.findOneAndUpdate({ patientId }, { category: record.cases[0].label });
    }

    record.markModified('cases');
    await record.save();

    res.json(record);
  } catch (err) {
    console.error("Error in deleteCase:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const deleted = await MedicalRecord.findOneAndDelete({ patientId: req.params.patientId });
    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get category-specific medical history and clinical profile template
 * Returns template fields and current patient data for the specified category
 */
exports.getCategoryMedicalHistory = async (req, res) => {
  try {
    const { patientId, category } = req.query;

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const patient = await Patient.findOne({ patientId }).lean();
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientCategory = (patient.category || category || "OPD").toString().trim().toLowerCase();
    
    // Define medical history templates for each category
    const categoryTemplates = {
      prenatal: {
        categoryName: "Prenatal Care",
        sections: [
          {
            sectionName: "Prenatal Care Details",
            fields: [
              { name: "gestationalWeek", label: "Gestational Week", type: "number" },
              { name: "trimester", label: "Trimester", type: "enum", values: ["1st Trimester", "2nd Trimester", "3rd Trimester"] },
              { name: "dueDate", label: "Expected Due Date (EDC)", type: "date" },
              { name: "riskLevel", label: "Risk Level", type: "enum", values: ["Low Risk", "Moderate Risk", "High Risk"] },
              { name: "nextVisitDate", label: "Next Visit Date", type: "date" },
              { name: "nextVisitTime", label: "Next Visit Time", type: "time" },
              { name: "nextVisitLocation", label: "Next Visit Location", type: "text" }
            ]
          },
          {
            sectionName: "Visit History",
            fields: [
              { name: "visitHistory", label: "Previous Prenatal Visits", type: "array", itemType: "object", subFields: ["date", "week", "staff", "notes"] }
            ]
          }
        ]
      },
      "tb dots": {
        categoryName: "TB DOTS Program",
        sections: [
          {
            sectionName: "TB Treatment Details",
            fields: [
              { name: "treatmentStartDate", label: "Treatment Start Date", type: "date" },
              { name: "treatmentPhase", label: "Treatment Phase", type: "enum", values: ["Intensive", "Continuation"] },
              { name: "regimen", label: "Treatment Regimen", type: "text" },
              { name: "adherencePercent", label: "Treatment Adherence %", type: "number" },
              { name: "nextVisitDate", label: "Next Visit Date", type: "date" },
              { name: "nextVisitTime", label: "Next Visit Time", type: "time" },
              { name: "nextVisitLocation", label: "Next Visit Location", type: "text" }
            ]
          },
          {
            sectionName: "Medication Adherence",
            fields: [
              { name: "medicationLogs", label: "Medication Logs", type: "array", itemType: "object", subFields: ["date", "medicine", "taken", "remarks"] }
            ]
          }
        ]
      },
      ncd: {
        categoryName: "Non-Communicable Disease",
        sections: [
          {
            sectionName: "NCD Risk Factors",
            fields: [
              { name: "hypertensionStage", label: "Hypertension Stage", type: "enum", values: ["Normal", "Elevated", "Stage 1 Hypertension", "Stage 2 Hypertension", "Hypertensive Crisis"] },
              { name: "diabetesType", label: "Diabetes Type", type: "enum", values: ["Type 1", "Type 2", "Gestational", "Pre-diabetic"] },
              { name: "lastHbA1c", label: "Last HbA1c Level", type: "text" },
              { name: "lastFastingGlucose", label: "Last Fasting Glucose", type: "text" },
              { name: "lastLDL", label: "Last LDL Level", type: "text" },
              { name: "medication", label: "Current Medications", type: "text" },
              { name: "complications", label: "Known Complications", type: "text" }
            ]
          }
        ]
      },
      pediatric: {
        categoryName: "Pediatric Care (Child Care)",
        sections: [
          {
            sectionName: "Section 1: Basic Baby Information",
            fields: [
              { name: "babyFullName", label: "Baby Full Name", type: "text", required: true, placeholder: "Enter baby full name" },
              { name: "timeOfBirth", label: "Time of Birth", type: "text", placeholder: "e.g. 08:30 AM" },
              { name: "placeOfBirth", label: "Place of Birth", type: "enum", values: ["Home", "Hospital", "Lying-in clinic"], required: true }
            ]
          },
          {
            sectionName: "Section 2: Birth Details",
            fields: [
              { name: "birthWeight", label: "Birth Weight", type: "text", required: true, placeholder: "e.g. 3.2 kg" },
              { name: "birthLength", label: "Birth Length (cm)", type: "text", placeholder: "Optional" },
              { name: "deliveryType", label: "Type of Delivery", type: "enum", values: ["Normal (NSD)", "Cesarean (CS)", "Assisted"], required: true },
              { name: "birthStatus", label: "Was the baby", type: "enum", values: ["Alive at birth", "Stillbirth"], required: true },
              { name: "hasComplications", label: "Any complications?", type: "enum", values: ["No", "Yes"], required: true },
              { name: "complicationsNotes", label: "Complications Notes", type: "textarea", placeholder: "Add notes if there were complications" }
            ]
          },
          {
            sectionName: "Section 3: Newborn Health & Interventions",
            fields: [
              { name: "vitaminKGiven", label: "Vitamin K Given?", type: "enum", values: ["Yes", "No"], required: true },
              { name: "eyeOintmentGiven", label: "Eye Ointment Given?", type: "enum", values: ["Yes", "No"], required: true },
              { name: "breastfeedingStarted", label: "Breastfeeding Started?", type: "enum", values: ["Yes", "No"], required: true },
              { name: "newbornScreeningDone", label: "Newborn Screening Done?", type: "enum", values: ["Yes", "No", "Planned"], required: true }
            ]
          },
          {
            sectionName: "Section 4: Immunization",
            fields: [
              { name: "bcgGiven", label: "BCG Given?", type: "enum", values: ["Yes", "No"], required: true },
              { name: "bcgDate", label: "BCG Date", type: "date" },
              { name: "hepaBGiven", label: "Hepatitis B Given?", type: "enum", values: ["Yes", "No"], required: true },
              { name: "hepaBDate", label: "Hepatitis B Date", type: "date" }
            ]
          },
          {
            sectionName: "Section 5: Follow-Up / Tracking Info",
            fields: [
              { name: "firstCheckupDate", label: "First Check-up Date", type: "date", required: true },
              { name: "assignedHealthWorker", label: "Assigned Health Worker / Barangay", type: "text", required: true, placeholder: "Name or barangay" },
              { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Add monitoring notes" }
            ]
          }
        ]
      },
      "family planning": {
        categoryName: "Family Planning",
        sections: [
          {
            sectionName: "Family Planning Details",
            fields: [
              { name: "method", label: "Family Planning Method", type: "text" },
              { name: "lastCheckup", label: "Last Checkup Date", type: "date" },
              { name: "nextFollowUp", label: "Next Follow-up Date", type: "date" },
              { name: "sideEffects", label: "Side Effects", type: "text" },
              { name: "partnerInvolved", label: "Partner Involved", type: "enum", values: ["Yes", "No"] }
            ]
          }
        ]
      },
      senior: {
        categoryName: "Senior Citizen Care",
        sections: [
          {
            sectionName: "Senior Benefits",
            fields: [
              { name: "philhealth", label: "PhilHealth ID", type: "text" },
              { name: "seniorCitizenId", label: "Senior Citizen ID", type: "text" },
              { name: "pension", label: "Pension Details", type: "text" },
              { name: "oscaId", label: "OSCA ID", type: "text" }
            ]
          }
        ]
      },
      immunization: {
        categoryName: "Immunization",
        sections: [
          {
            sectionName: "Vaccination Schedule",
            fields: [
              { name: "immunizationStatus", label: "Overall Immunization Status", type: "text" },
              { name: "nextDueVaccine", label: "Next Due Vaccine", type: "text" }
            ]
          }
        ]
      },
      dental: {
        categoryName: "Dental Care",
        sections: [
          {
            sectionName: "Dental Examination",
            fields: [
              { name: "lastDentalCheckup", label: "Last Dental Checkup", type: "date" },
              { name: "dentalCondition", label: "Current Dental Condition", type: "text" },
              { name: "nextDentalVisit", label: "Next Dental Visit", type: "date" }
            ]
          }
        ]
      }
    };

    // Get template for current category
    let template = categoryTemplates[patientCategory];
    if (!template) {
      template = {
        categoryName: "General OPD",
        sections: [
          {
            sectionName: "General Information",
            fields: [
              { name: "lastVisit", label: "Last Visit", type: "date" },
              { name: "knownConditions", label: "Known Conditions", type: "text" }
            ]
          }
        ]
      };
    }

    // Extract category-specific patient data
    let categoryData = {};
    
    if (patientCategory === "prenatal") {
      categoryData = {
        ...patient.prenatalData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else if (patientCategory === "tb dots" || patientCategory === "tb") {
      categoryData = {
        ...patient.tbDotsData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else if (patientCategory === "ncd") {
      categoryData = {
        ...patient.ncdData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else if (patientCategory === "pediatric" || patientCategory === "child care") {
      categoryData = {
        ...patient.pediatricData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else if (patientCategory === "family planning") {
      categoryData = {
        ...patient.familyPlanningData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else if (patientCategory === "senior") {
      categoryData = {
        ...patient.seniorData,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    } else {
      categoryData = {
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        surgeries: patient.surgeries,
        medications: patient.medications
      };
    }

    // Add general medical history section to all categories
    const generalMedicalHistorySection = {
      sectionName: "General Medical History",
      fields: [
        { name: "medicalHistory", label: "Past Illnesses & Conditions", type: "array", itemType: "object", subFields: ["condition", "diagnosedDate", "notes", "status"] },
        { name: "allergies", label: "Allergies", type: "array", itemType: "object", subFields: ["allergen", "reaction", "severity"], highlight: true },
        { name: "surgeries", label: "Past Surgeries", type: "array", itemType: "object", subFields: ["procedure", "date", "hospital", "notes"] },
        { name: "medications", label: "Current Medications", type: "array", itemType: "object", subFields: ["name", "dosage", "frequency", "prescribedBy", "status"] }
      ]
    };

    // Ensure template has the general medical history section
    if (!template.sections.find(s => s.sectionName === "General Medical History")) {
      template.sections.push(generalMedicalHistorySection);
    }

    res.json({
      template,
      patientData: {
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        bloodType: patient.bloodType,
        contact: patient.contact,
        address: patient.address,
        category: patient.category,
        categoryData
      }
    });
  } catch (err) {
    console.error("Error in getCategoryMedicalHistory:", err);
    res.status(500).json({ message: err.message });
  }
};
