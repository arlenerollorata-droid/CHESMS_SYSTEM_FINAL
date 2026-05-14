import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faDownload, 
  faFilter, 
  faUserInjured, 
  faEdit, 
  faTrash, 
  faTimes,
  faSearch,
  faSync,
  faTint,
  faPhone,
  faMapMarkerAlt,
  faNotesMedical,
  faHeartbeat,
  faInfoCircle,
  faVenusMars,
  faBirthdayCake,
  faIdCard,
  faPills,
  faAllergies,
  faSyringe,
  faStethoscope,
  faList,
  faUsers,
  faUserPlus,
  faClock,
  faCheckCircle,
  faTh,
  faBaby,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "https://chesmssystemfinal-production.up.railway.app/api/patients";
const RECORDS_API = "https://chesmssystemfinal-production.up.railway.app/api/records";
const RESIDENTS_API = "https://chesmssystemfinal-production.up.railway.app/api/residents";

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPurok, setFilterPurok] = useState("All");
  const [filterBarangay, setFilterBarangay] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [toast, setToast] = useState(null);
  const [formActiveTab, setFormActiveTab] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return {
      total: patients.length,
      recent: patients.filter(p => new Date(p.createdAt) > thirtyDaysAgo).length,
      active: patients.filter(p => p.status === 'Active').length,
      highRisk: patients.filter(p => p.prenatalData?.riskLevel === 'High Risk').length
    };
  }, [patients]);
  
  // Toggle states for medical sections (hidden by default)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [showSurgeries, setShowSurgeries] = useState(false);
  const [showMedications, setShowMedications] = useState(false);

  const getInitialFormData = (patientId = `PAT-${new Date().getFullYear()}-0001`) => ({
    patientId: patientId,
    residentId: "", // Link to Census
    name: "",
    birthdate: "",
    age: "",
    gender: "Male",
    civilStatus: "Single",
    address: "",
    barangay: "",
    purok: "",
    region: "",
    province: "",
    municipality: "",
    postalCode: "",
    contact: "",
    bloodType: "Unknown",
    category: "", // Forced selection
    bp: "",
    bloodSugar: "",
    weight: "",
    height: "",
    lastVisit: "",
    status: "Active",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    medicalHistory: [],
    allergies: [],
    surgeries: [],
    medications: [],
    prenatalGestationalWeek: "",
    prenatalTrimester: "",
    prenatalDueDate: "",
    prenatalRiskLevel: "",
    prenatalProgressPercent: "",
    prenatalBabyInsight: "",
    prenatalNextVisitDate: "",
    prenatalNextVisitTime: "",
    prenatalNextVisitLocation: "",
    tbTreatmentStartDate: "",
    tbTreatmentPhase: "",
    tbRegimen: "",
    tbAdherencePercent: "",
    tbNextVisitDate: "",
    tbNextVisitTime: "",
    tbNextVisitLocation: "",
    pediatricSchool: "",
    pediatricGrade: "",
    pediatricGuardianName: "",
    pediatricGuardianRelation: "",
    pediatricGuardianPhone: "",
    pediatricBirthWeight: "",
    pediatricBirthLength: "",
    pediatricTimeOfBirth: "",
    pediatricPlaceOfBirth: "",
    pediatricDeliveryType: "",
    pediatricBirthStatus: "",
    pediatricHasComplications: "",
    pediatricComplicationsNotes: "",
    pediatricVitaminKGiven: "",
    pediatricEyeOintmentGiven: "",
    pediatricBreastfeedingStarted: "",
    pediatricNewbornScreeningDone: "",
    pediatricBcgGiven: "",
    pediatricBcgDate: "",
    pediatricHepaBGiven: "",
    pediatricHepaBDate: "",
    pediatricFirstCheckupDate: "",
    pediatricAssignedHealthWorker: "",
    pediatricRemarks: "",
    pediatricBabyFullName: "",
    pediatricImmunizationStatus: "",
    seniorPhilhealth: "",
    seniorSeniorCitizenId: "",
    seniorPension: "",
    seniorOscaId: "",
    seniorMobilityStatus: "",
    seniorCognitiveAssessment: "",
    seniorVision: "",
    seniorHearing: "",
    seniorFallRisk: "",
    seniorNutrition: "",
    seniorMedications: "",
    seniorChronicConditions: "",
    seniorVaccinations: "",
    seniorCaregiverInfo: "",
    seniorFollowUpDate: "",
    seniorMentalHealthNotes: "",
    ncdHypertensionStage: "",
    ncdDiabetesType: "",
    ncdLastHbA1c: "",
    ncdLastFastingGlucose: "",
    ncdLastLDL: "",
    ncdMedication: "",
    ncdComplications: "",
    fpMethodChosen: "",
    fpPreviousMethod: "",
    fpPregnancyHistory: "",
    fpMenstrualHistory: "",
    fpBloodPressure: "",
    fpWeight: "",
    fpCounselingProvided: "",
    fpSideEffects: "",
    fpNextResupplyDate: "",
    fpFollowUpDate: "",
    fpRemarks: "",
    immVaccineType: "",
    immDoseNumber: "",
    immDateAdministered: "",
    immBatchLot: "",
    immVaccinator: "",
    immInjectionSite: "",
    immNextDoseDate: "",
    immAdverseReaction: "",
    immStatus: "",
    immRemarks: "",
    dentalChiefComplaint: "",
    dentalOralExamination: "",
    dentalAffectedTooth: "",
    dentalChart: "",
    dentalProcedureNeeded: "",
    dentalPrescription: "",
    dentalOralHygieneAdvice: "",
    dentalNextVisit: "",
    dentalDentistNotes: "",
    hypBloodPressure: "",
    hypPulseRate: "",
    hypWeight: "",
    hypMedication: "",
    hypSmokingStatus: "",
    hypComplications: "",
    hypNextCheck: "",
    diaFBS: "",
    diaRBS: "",
    diaHbA1c: "",
    diaInsulinUse: "",
    diaMedication: "",
    diaFootExam: "",
    diaEyeExam: "",
    diaHypoglycemia: "",
    diaComplications: "",
    diaFollowUp: "",
    asthmaSeverity: "",
    asthmaPeakFlow: "",
    asthmaOxygenSat: "",
    asthmaNebulization: "",
    asthmaEmergency: "",
    asthmaSmoking: "",
    asthmaTriggers: "",
    asthmaAssessment: "",
    asthmaMedication: "",
    asthmaAllergy: "",
    asthmaFollowUp: "",
    asthmaRemarks: ""

  });
  
  const [formData, setFormData] = useState({
    patientId: `PAT-${new Date().getFullYear()}-0001`,
    residentId: "",
    name: "",
    birthdate: "",
    age: "",
    gender: "Male",
    civilStatus: "Single",
    address: "",
    barangay: "",
    purok: "",
    region: "",
    province: "",
    municipality: "",
    postalCode: "",
    contact: "",
    bloodType: "Unknown",
    category: "OPD",
    bp: "",
    bloodSugar: "",
    weight: "",
    height: "",
    lastVisit: "",
    status: "Active",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    medicalHistory: [],
    allergies: [],
    surgeries: [],
    medications: [],
    prenatalGestationalWeek: "",
    prenatalTrimester: "",
    prenatalDueDate: "",
    prenatalRiskLevel: "",
    prenatalProgressPercent: "",
    prenatalBabyInsight: "",
    prenatalNextVisitDate: "",
    prenatalNextVisitTime: "",
    prenatalNextVisitLocation: "",
    tbTreatmentStartDate: "",
    tbTreatmentPhase: "",
    tbRegimen: "",
    tbAdherencePercent: "",
    tbNextVisitDate: "",
    tbNextVisitTime: "",
    tbNextVisitLocation: "",
    pediatricSchool: "",
    pediatricGrade: "",
    pediatricGuardianName: "",
    pediatricGuardianRelation: "",
    pediatricGuardianPhone: "",
    pediatricBirthWeight: "",
    pediatricBirthLength: "",
    pediatricTimeOfBirth: "",
    pediatricPlaceOfBirth: "",
    pediatricDeliveryType: "",
    pediatricBirthStatus: "",
    pediatricHasComplications: "",
    pediatricComplicationsNotes: "",
    pediatricVitaminKGiven: "",
    pediatricEyeOintmentGiven: "",
    pediatricBreastfeedingStarted: "",
    pediatricNewbornScreeningDone: "",
    pediatricBcgGiven: "",
    pediatricBcgDate: "",
    pediatricHepaBGiven: "",
    pediatricHepaBDate: "",
    pediatricFirstCheckupDate: "",
    pediatricAssignedHealthWorker: "",
    pediatricRemarks: "",
    pediatricBabyFullName: "",
    pediatricImmunizationStatus: "",
    seniorPhilhealth: "",
    seniorSeniorCitizenId: "",
    seniorPension: "",
    seniorOscaId: "",
    seniorMobilityStatus: "",
    seniorCognitiveAssessment: "",
    seniorVision: "",
    seniorHearing: "",
    seniorFallRisk: "",
    seniorNutrition: "",
    seniorMedications: "",
    seniorChronicConditions: "",
    seniorVaccinations: "",
    seniorCaregiverInfo: "",
    seniorFollowUpDate: "",
    seniorMentalHealthNotes: "",
    ncdHypertensionStage: "",
    ncdDiabetesType: "",
    ncdLastHbA1c: "",
    ncdLastFastingGlucose: "",
    ncdLastLDL: "",
    ncdMedication: "",
    ncdComplications: "",
    fpMethodChosen: "",
    fpPreviousMethod: "",
    fpPregnancyHistory: "",
    fpMenstrualHistory: "",
    fpBloodPressure: "",
    fpWeight: "",
    fpCounselingProvided: "",
    fpSideEffects: "",
    fpNextResupplyDate: "",
    fpFollowUpDate: "",
    fpRemarks: "",
    immVaccineType: "",
    immDoseNumber: "",
    immDateAdministered: "",
    immBatchLot: "",
    immVaccinator: "",
    immInjectionSite: "",
    immNextDoseDate: "",
    immAdverseReaction: "",
    immStatus: "",
    immRemarks: "",
    dentalChiefComplaint: "",
    dentalOralExamination: "",
    dentalAffectedTooth: "",
    dentalChart: "",
    dentalProcedureNeeded: "",
    dentalPrescription: "",
    dentalOralHygieneAdvice: "",
    dentalNextVisit: "",
    dentalDentistNotes: "",
    hypBloodPressure: "",
    hypPulseRate: "",
    hypWeight: "",
    hypMedication: "",
    hypSmokingStatus: "",
    hypComplications: "",
    hypNextCheck: "",
    diaFBS: "",
    diaRBS: "",
    diaHbA1c: "",
    diaInsulinUse: "",
    diaMedication: "",
    diaFootExam: "",
    diaEyeExam: "",
    diaHypoglycemia: "",
    diaComplications: "",
    diaFollowUp: "",
    asthmaSeverity: "",
    asthmaPeakFlow: "",
    asthmaOxygenSat: "",
    asthmaNebulization: "",
    asthmaEmergency: "",
    asthmaSmoking: "",
    asthmaTriggers: "",
    asthmaAssessment: "",
    asthmaMedication: "",
    asthmaAllergy: "",
    asthmaFollowUp: "",
    asthmaRemarks: ""

  });

  const [newCondition, setNewCondition] = useState({ condition: "", diagnosedDate: "", notes: "", status: "Active" });
  const [newAllergy, setNewAllergy] = useState({ allergen: "", reaction: "", severity: "Moderate" });
  const [newSurgery, setNewSurgery] = useState({ procedure: "", date: "", hospital: "", notes: "" });
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", frequency: "", startDate: "", prescribedBy: "", status: "Active" });

  const buildPayload = () => {
    console.log("DEBUG: buildPayload medicalHistory:", formData.medicalHistory);
    const prenatalWeek = formData.prenatalGestationalWeek ? Number(formData.prenatalGestationalWeek) : undefined;
    const prenatalProgress = formData.prenatalProgressPercent
      ? Number(formData.prenatalProgressPercent)
      : (typeof prenatalWeek === "number" ? Math.round((prenatalWeek / 40) * 100) : undefined);

    // Initialize visit history if category requires it
    const prenatalVisitHistory = formData.category === 'Prenatal' ? 
      [{
        date: new Date(),
        week: prenatalWeek?.toString() || 'Unknown',
        staff: 'BHW',
        notes: 'Initial prenatal visit'
      }] : [];

    const tbVisitHistory = formData.category === 'TB DOTS' ?
      [{
        date: new Date(),
        week: 'TB DOTS',
        staff: 'BHW',
        notes: 'Initial TB DOTS visit'
      }] : [];

    // Base payload - always included
    const basePayload = {
      patientId: formData.patientId,
      name: formData.name.trim(),
      birthdate: formData.birthdate || null,
      age: formData.age ? Number(formData.age) : undefined,
      gender: formData.gender,
      civilStatus: formData.civilStatus,
      address: formData.address.trim(),
      barangay: formData.barangay.trim(),
      purok: formData.purok.trim(),
      contact: formData.contact.trim(),
      bloodType: formData.bloodType,
      category: formData.category,
      bp: formData.bp.trim(),
      bloodSugar: formData.bloodSugar.trim(),
      weight: formData.weight.trim(),
      height: formData.height.trim(),
      lastVisit: formData.lastVisit || null,
      status: formData.status,
      emergencyContact: {
        name: (formData.emergencyContactName || "").trim(),
        relation: (formData.emergencyContactRelation || "").trim(),
        phone: (formData.emergencyContactPhone || "").trim()
      },
      medicalHistory: formData.medicalHistory,
      allergies: formData.allergies,
      surgeries: formData.surgeries,
      medications: formData.medications
    };

    // Add ONLY the relevant case-specific data based on category
    const category = formData.category?.trim().toLowerCase() || '';
    
    if (category === 'prenatal') {
      basePayload.prenatalData = {
        gestationalWeek: prenatalWeek,
        trimester: formData.prenatalTrimester,
        dueDate: formData.prenatalDueDate || null,
        riskLevel: formData.prenatalRiskLevel,
        progressPercent: typeof prenatalProgress === "number" ? Math.max(0, Math.min(100, prenatalProgress)) : undefined,
        babyInsight: (formData.prenatalBabyInsight || "").trim(),
        nextVisitDate: formData.prenatalNextVisitDate || null,
        nextVisitTime: (formData.prenatalNextVisitTime || "").trim(),
        nextVisitLocation: (formData.prenatalNextVisitLocation || "").trim(),
        visitHistory: prenatalVisitHistory
      };
    } else if (category === 'tb dots' || category === 'tb') {
      basePayload.tbDotsData = {
        treatmentStartDate: formData.tbTreatmentStartDate || null,
        treatmentPhase: formData.tbTreatmentPhase,
        regimen: (formData.tbRegimen || "").trim(),
        adherencePercent: formData.tbAdherencePercent ? Number(formData.tbAdherencePercent) : undefined,
        nextVisitDate: formData.tbNextVisitDate || null,
        nextVisitTime: (formData.tbNextVisitTime || "").trim(),
        nextVisitLocation: (formData.tbNextVisitLocation || "").trim(),
        visitHistory: tbVisitHistory
      };
    } else if (category === 'pediatric' || category === 'child care') {
      basePayload.pediatricData = {
        babyFullName: (formData.pediatricBabyFullName || "").trim(),
        timeOfBirth: (formData.pediatricTimeOfBirth || "").trim(),
        placeOfBirth: formData.pediatricPlaceOfBirth,
        birthWeight: (formData.pediatricBirthWeight || "").trim(),
        birthLength: (formData.pediatricBirthLength || "").trim(),
        deliveryType: formData.pediatricDeliveryType,
        birthStatus: formData.pediatricBirthStatus,
        hasComplications: formData.pediatricHasComplications,
        complicationsNotes: (formData.pediatricComplicationsNotes || "").trim(),
        vitaminKGiven: formData.pediatricVitaminKGiven,
        eyeOintmentGiven: formData.pediatricEyeOintmentGiven,
        breastfeedingStarted: formData.pediatricBreastfeedingStarted,
        newbornScreeningDone: formData.pediatricNewbornScreeningDone,
        bcgGiven: formData.pediatricBcgGiven,
        bcgDate: formData.pediatricBcgDate || null,
        hepaBGiven: formData.pediatricHepaBGiven,
        hepaBDate: formData.pediatricHepaBDate || null,
        firstCheckupDate: formData.pediatricFirstCheckupDate || null,
        assignedHealthWorker: (formData.pediatricAssignedHealthWorker || "").trim(),
        remarks: (formData.pediatricRemarks || "").trim(),
        school: (formData.pediatricSchool || "").trim(),
        grade: (formData.pediatricGrade || "").trim(),
        guardianName: (formData.pediatricGuardianName || "").trim(),
        guardianRelation: (formData.pediatricGuardianRelation || "").trim(),
        guardianPhone: (formData.pediatricGuardianPhone || "").trim(),
        immunizationStatus: formData.pediatricImmunizationStatus
      };
    } else if (category === 'senior') {
      basePayload.seniorData = {
        philhealth: (formData.seniorPhilhealth || "").trim(),
        seniorCitizenId: (formData.seniorSeniorCitizenId || "").trim(),
        pension: (formData.seniorPension || "").trim(),
        oscaId: (formData.seniorOscaId || "").trim(),
        mobilityStatus: formData.seniorMobilityStatus,
        cognitiveAssessment: formData.seniorCognitiveAssessment,
        visionAssessment: formData.seniorVision,
        hearingAssessment: formData.seniorHearing,
        medications: (formData.seniorMedications || "").split(',').map(s => s.trim()),
        fallRisk: formData.seniorFallRisk,
        caregiverInfo: (formData.seniorCaregiverInfo || "").trim(),
        chronicConditions: (formData.seniorChronicConditions || "").split(',').map(s => s.trim()),
        vaccinations: (formData.seniorVaccinations || "").split(',').map(s => s.trim()),
        nutritionAssessment: formData.seniorNutrition,
        mentalHealthNotes: (formData.seniorMentalHealthNotes || "").trim(),
        followUpDate: formData.seniorFollowUpDate || null
      };
    } else if (category === 'immunization' || category === 'vaccination') {
      basePayload.immunizationData = {
        vaccineType: formData.immVaccineType,
        doseNumber: formData.immDoseNumber,
        dateAdministered: formData.immDateAdministered || null,
        batchLotNumber: (formData.immBatchLot || "").trim(),
        vaccinator: (formData.immVaccinator || "").trim(),
        injectionSite: formData.immInjectionSite,
        nextDoseSchedule: formData.immNextDoseDate || null,
        adverseReaction: (formData.immAdverseReaction || "").split(',').map(s => s.trim()),
        immunizationStatus: formData.immStatus,
        remarks: (formData.immRemarks || "").trim()
      };
    } else if (category === 'dental') {
      basePayload.dentalData = {
        chiefComplaint: (formData.dentalChiefComplaint || "").trim(),
        oralExamination: (formData.dentalOralExamination || "").trim(),
        affectedTooth: formData.dentalAffectedTooth,
        dentalChart: formData.dentalChart,
        procedureNeeded: (formData.dentalProcedureNeeded || "").split(',').map(s => s.trim()),
        prescriptions: (formData.dentalPrescription || "").split(',').map(s => s.trim()),
        oralHygieneAdvice: (formData.dentalOralHygieneAdvice || "").trim(),
        nextVisit: formData.dentalNextVisit || null,
        dentistNotes: (formData.dentalDentistNotes || "").trim()
      };
    } else if (category === 'family planning') {
      basePayload.familyPlanningData = {
        methodChosen: formData.fpMethodChosen,
        previousMethod: formData.fpPreviousMethod,
        pregnancyHistory: (formData.fpPregnancyHistory || "").trim(),
        menstrualHistory: (formData.fpMenstrualHistory || "").trim(),
        bp: (formData.fpBloodPressure || "").trim(),
        weight: (formData.fpWeight || "").trim(),
        counselingProvided: (formData.fpCounselingProvided || "").split(',').map(s => s.trim()).filter(Boolean),
        sideEffects: (formData.fpSideEffects || "").split(',').map(s => s.trim()).filter(Boolean),
        nextResupplyDate: formData.fpNextResupplyDate || null,
        followUpDate: formData.fpFollowUpDate || null,
        remarks: (formData.fpRemarks || "").trim()
      };
    } else if (category === 'ncd') {
      basePayload.ncdData = {
        hypertensionStage: formData.ncdHypertensionStage,
        diabetesType: formData.ncdDiabetesType,
        lastHbA1c: (formData.ncdLastHbA1c || "").trim(),
        lastFastingGlucose: (formData.ncdLastFastingGlucose || "").trim(),
        lastLDL: (formData.ncdLastLDL || "").trim(),
        medication: (formData.ncdMedication || "").trim(),
        complications: (formData.ncdComplications || "").trim()
      };
    } else if (category === 'asthma') {
      basePayload.asthmaData = {
        severity: formData.asthmaSeverity,
        triggers: (formData.asthmaTriggers || "").split(',').map(s => s.trim()),
        peakFlow: (formData.asthmaPeakFlow || "").trim(),
        oxygenSat: (formData.asthmaOxygenSat || "").trim(),
        breathingAssessment: (formData.asthmaAssessment || "").trim(),
        medications: (formData.asthmaMedication || "").split(',').map(s => s.trim()),
        nebulization: formData.asthmaNebulization,
        emergencyEpisodes: formData.asthmaEmergency ? Number(formData.asthmaEmergency) : 0,
        allergyHistory: (formData.asthmaAllergy || "").trim(),
        smokingExposure: formData.asthmaSmoking,
        followUpDate: formData.asthmaFollowUp || null,
        remarks: (formData.asthmaRemarks || "").trim()
      };
    }

    return basePayload;
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const [patientsRes, residentsRes, recordsRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(RESIDENTS_API).catch(() => ({ data: [] })),
        axios.get(RECORDS_API).catch(() => ({ data: [] }))
      ]);
      setPatients(patientsRes.data);
      setResidents(residentsRes.data || []);
      setMedicalRecords(recordsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasMedicalRecord = (patientId) => {
    return medicalRecords.some(r => r.patientId === patientId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "name") {
      const query = value.trim();
      setFormData({ ...formData, name: value });
      
      if (query.length >= 2) {
        const patientSuggestions = patients.filter(p => {
          const nameMatch = p.name?.toLowerCase().includes(query.toLowerCase());
          const idMatch = p.patientId?.toLowerCase().includes(query.toLowerCase());
          return nameMatch || idMatch;
        }).slice(0, 5).map(p => ({ ...p, source: 'patient' }));
        
        const residentSuggestions = residents.filter(r => {
          const firstName = r.firstName || '';
          const middleName = r.middleName || '';
          const lastName = r.lastName || '';
          const fullName = `${firstName} ${middleName} ${lastName}`.toLowerCase();
          const reversedName = `${lastName} ${firstName}`.toLowerCase();
          return fullName.includes(query.toLowerCase()) || reversedName.includes(query.toLowerCase());
        }).slice(0, 10).map(r => ({
          ...r,
          name: `${r.firstName || ''} ${r.middleName || ''} ${r.lastName || ''}`.trim(),
          source: 'resident'
        }));
        
        setSearchSuggestions([...patientSuggestions, ...residentSuggestions]);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }
    
    // Auto-calculate age from birthdate and check for duplicates
    if (name === "birthdate" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData({ ...formData, birthdate: value, age: age.toString() });

      // Real-time duplicate check
      if (formData.name && value && !isEditing) {
        axios.get(`${API_URL}/check-duplicate`, {
          params: { name: formData.name, birthdate: value }
        }).then(res => {
          if (res.data.isDuplicate) {
            alert(`Note: A patient named "${formData.name}" with this birthdate is already registered as ${res.data.patient.patientId}.`);
          }
        });
      }
    } else if (name !== "name") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const selectSuggestion = async (item) => {
    const isResident = item.source === 'resident';
    
    if (isResident) {
      // Check if this resident is already a patient
      try {
        const res = await axios.get(`${API_URL}/check-duplicate`, {
          params: { residentId: item._id }
        });
        if (res.data.isDuplicate) {
          if (window.confirm(`This resident is already registered as patient ${res.data.patient.patientId}. Would you like to edit their record instead?`)) {
            openEditModal(res.data.patient);
            setSearchSuggestions([]);
            setShowSuggestions(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error checking duplicate resident:", err);
      }
    }

    let bDate = "";
    const birthDateVal = isResident ? item.birthdate || item.birthDate : item.birthdate;
    if (birthDateVal) {
      bDate = new Date(birthDateVal).toISOString().split('T')[0];
    }
    
    let ageValue = item.age;
    if (!ageValue && bDate) {
      const birthDate = new Date(bDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      ageValue = age.toString();
    }
    
    const fullName = isResident 
      ? `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''} ${item.suffix || ''}`.trim()
      : item.name;
    
    const selectedCategory = item.category || "OPD";
    
    if (isResident) {
      // ADVANCED AUTO-FILL: Map every possible field from Resident to Patient form
      setFormData({
        ...formData,
        residentId: item._id,
        name: fullName,
        birthdate: bDate,
        age: ageValue || "",
        gender: item.gender || "Male",
        civilStatus: item.civilStatus || "Single",
        address: item.streetAddress || item.address || "",
        barangay: item.barangay || "",
        purok: item.purok || "",
        region: item.region || "", // Clear/Map from resident if exists
        province: item.province || "",
        municipality: item.municipality || "",
        postalCode: item.postalCode || "",
        contact: item.contactNumber || item.contactNo || "",
        bloodType: item.bloodType || "Unknown",
        category: selectedCategory,
        status: "Active",
        emergencyContactName: item.emergencyContact || (item.seniorRoster?.[0]?.emergencyContact) || "",
        emergencyContactPhone: item.emergencyPhone || (item.seniorRoster?.[0]?.emergencyPhone) || "",
        emergencyContactRelation: item.emergencyRelation || (item.seniorRoster?.[0]?.emergencyRelation) || "",
        // Pre-fill senior data if resident is a senior
        seniorPhilhealth: item.philhealthNumber || "",
        seniorSeniorCitizenId: item.oscaId || (item.seniorRoster?.[0]?.oscaId) || "",
        seniorPension: item.seniorRoster?.[0]?.pensionAmount || ""
      });
    } else {
      // For existing patient suggestions
      openEditModal(item);
    }
    
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const openAddModal = () => {
    setIsEditing(false);
    
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const nextPatientId = `PAT-${year}-${randomNum}`;
    
    setFormData(getInitialFormData(nextPatientId));
    setNewCondition({ condition: "", diagnosedDate: "", notes: "", status: "Active" });
    setNewAllergy({ allergen: "", reaction: "", severity: "Moderate" });
    setNewSurgery({ procedure: "", date: "", hospital: "", notes: "" });
    setNewMedication({ name: "", dosage: "", frequency: "", startDate: "", prescribedBy: "", status: "Active" });
    setIsModalOpen(true);
    setFormActiveTab(1);
  };

  const openEditModal = (patient) => {
    setIsEditing(true);
    setCurrentPatientId(patient._id);
    
    let bDate = "";
    if (patient.birthdate) {
      bDate = new Date(patient.birthdate).toISOString().split('T')[0];
    }

    setFormData({
      patientId: patient.patientId || `PAT-${new Date().getFullYear()}-0000`,
      name: patient.name || "",
      birthdate: bDate,
      age: patient.age || "",
      gender: patient.gender || "Male",
      civilStatus: patient.civilStatus || "Single",
      address: patient.address || "",
      barangay: patient.barangay || "",
      purok: patient.purok || "",
      region: patient.region || "Region III (Central Luzon)",
      province: patient.province || "Bulacan",
      municipality: patient.municipality || "San Jose del Monte",
      postalCode: patient.postalCode || "3023",
      contact: patient.contact || "",
      bloodType: patient.bloodType || "Unknown",
      category: patient.category || "OPD",
      bp: patient.bp || "",
      bloodSugar: patient.bloodSugar || "",
      weight: patient.weight || "",
      height: patient.height || "",
      lastVisit: patient.lastVisit || "",
      status: patient.status || "Active",
      emergencyContactName: patient.emergencyContact?.name || "",
      emergencyContactRelation: patient.emergencyContact?.relation || "",
      emergencyContactPhone: patient.emergencyContact?.phone || "",
      medicalHistory: Array.isArray(patient.medicalHistory) ? patient.medicalHistory : [],
      allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
      surgeries: Array.isArray(patient.surgeries) ? patient.surgeries : [],
      medications: Array.isArray(patient.medications) ? patient.medications : [],
      prenatalGestationalWeek: patient.prenatalData?.gestationalWeek ?? "",
      prenatalTrimester: patient.prenatalData?.trimester || "2nd Trimester",
      prenatalDueDate: patient.prenatalData?.dueDate ? new Date(patient.prenatalData.dueDate).toISOString().split('T')[0] : "",
      prenatalRiskLevel: patient.prenatalData?.riskLevel || "Low Risk",
      prenatalProgressPercent: patient.prenatalData?.progressPercent ?? "",
      prenatalBabyInsight: patient.prenatalData?.babyInsight || "",
      prenatalNextVisitDate: patient.prenatalData?.nextVisitDate ? new Date(patient.prenatalData.nextVisitDate).toISOString().split('T')[0] : "",
      prenatalNextVisitTime: patient.prenatalData?.nextVisitTime || "",
      prenatalNextVisitLocation: patient.prenatalData?.nextVisitLocation || "",
      tbTreatmentStartDate: patient.tbDotsData?.treatmentStartDate ? new Date(patient.tbDotsData.treatmentStartDate).toISOString().split('T')[0] : "",
      tbTreatmentPhase: patient.tbDotsData?.treatmentPhase || "Intensive",
      tbRegimen: patient.tbDotsData?.regimen || "",
      tbAdherencePercent: patient.tbDotsData?.adherencePercent ?? "",
      tbNextVisitDate: patient.tbDotsData?.nextVisitDate ? new Date(patient.tbDotsData.nextVisitDate).toISOString().split('T')[0] : "",
      tbNextVisitTime: patient.tbDotsData?.nextVisitTime || "",
      tbNextVisitLocation: patient.tbDotsData?.nextVisitLocation || "",
      pediatricSchool: patient.pediatricData?.school || "",
      pediatricGrade: patient.pediatricData?.grade || "",
      pediatricGuardianName: patient.pediatricData?.guardianName || "",
      pediatricGuardianRelation: patient.pediatricData?.guardianRelation || "",
      pediatricGuardianPhone: patient.pediatricData?.guardianPhone || "",
      pediatricBirthWeight: patient.pediatricData?.birthWeight || "",
      pediatricBabyFullName: patient.pediatricData?.babyFullName || "",
      pediatricTimeOfBirth: patient.pediatricData?.timeOfBirth || "",
      pediatricPlaceOfBirth: patient.pediatricData?.placeOfBirth || "Hospital",
      pediatricBirthLength: patient.pediatricData?.birthLength || "",
      pediatricDeliveryType: patient.pediatricData?.deliveryType || "Normal (NSD)",
      pediatricBirthStatus: patient.pediatricData?.birthStatus || "Alive at birth",
      pediatricHasComplications: patient.pediatricData?.hasComplications || "No",
      pediatricComplicationsNotes: patient.pediatricData?.complicationsNotes || "",
      pediatricVitaminKGiven: patient.pediatricData?.vitaminKGiven || "No",
      pediatricEyeOintmentGiven: patient.pediatricData?.eyeOintmentGiven || "No",
      pediatricBreastfeedingStarted: patient.pediatricData?.breastfeedingStarted || "No",
      pediatricNewbornScreeningDone: patient.pediatricData?.newbornScreeningDone || "No",
      pediatricBcgGiven: patient.pediatricData?.bcgGiven || "No",
      pediatricBcgDate: patient.pediatricData?.bcgDate ? new Date(patient.pediatricData.bcgDate).toISOString().split('T')[0] : "",
      pediatricHepaBGiven: patient.pediatricData?.hepaBGiven || "No",
      pediatricHepaBDate: patient.pediatricData?.hepaBDate ? new Date(patient.pediatricData.hepaBDate).toISOString().split('T')[0] : "",
      pediatricFirstCheckupDate: patient.pediatricData?.firstCheckupDate ? new Date(patient.pediatricData.firstCheckupDate).toISOString().split('T')[0] : "",
      pediatricAssignedHealthWorker: patient.pediatricData?.assignedHealthWorker || "",
      pediatricRemarks: patient.pediatricData?.remarks || "",
      pediatricImmunizationStatus: patient.pediatricData?.immunizationStatus || "Complete",
      seniorPhilhealth: patient.seniorData?.philhealth || "",
      seniorSeniorCitizenId: patient.seniorData?.seniorCitizenId || "",
      seniorPension: patient.seniorData?.pension || "",
      seniorOscaId: patient.seniorData?.oscaId || "",
      ncdHypertensionStage: patient.ncdData?.hypertensionStage || "Normal",
      ncdDiabetesType: patient.ncdData?.diabetesType || "Type 2",
      ncdLastHbA1c: patient.ncdData?.lastHbA1c || "",
      ncdLastFastingGlucose: patient.ncdData?.lastFastingGlucose || "",
      ncdLastLDL: patient.ncdData?.lastLDL || "",
      ncdMedication: patient.ncdData?.medication || "",
      ncdComplications: patient.ncdData?.complications || "",
      fpMethodChosen: patient.familyPlanningData?.methodChosen || "",
      fpPreviousMethod: patient.familyPlanningData?.previousMethod || "",
      fpPregnancyHistory: patient.familyPlanningData?.pregnancyHistory || "",
      fpMenstrualHistory: patient.familyPlanningData?.menstrualHistory || "",
      fpBloodPressure: patient.familyPlanningData?.bp || "",
      fpWeight: patient.familyPlanningData?.weight || "",
      fpCounselingProvided: Array.isArray(patient.familyPlanningData?.counselingProvided) ? patient.familyPlanningData.counselingProvided.join(', ') : "",
      fpSideEffects: Array.isArray(patient.familyPlanningData?.sideEffects) ? patient.familyPlanningData.sideEffects.join(', ') : "",
      fpNextResupplyDate: patient.familyPlanningData?.nextResupplyDate ? new Date(patient.familyPlanningData.nextResupplyDate).toISOString().split('T')[0] : "",
      fpFollowUpDate: patient.familyPlanningData?.followUpDate ? new Date(patient.familyPlanningData.followUpDate).toISOString().split('T')[0] : "",
      fpRemarks: patient.familyPlanningData?.remarks || "",
    });
    setNewCondition({ condition: "", diagnosedDate: "", notes: "", status: "Active" });
    setNewAllergy({ allergen: "", reaction: "", severity: "Moderate" });
    setNewSurgery({ procedure: "", date: "", hospital: "", notes: "" });
    setNewMedication({ name: "", dosage: "", frequency: "", startDate: "", prescribedBy: "", status: "Active" });
    setIsModalOpen(true);
    setFormActiveTab(1);
  };

  const addMedicalCondition = () => {
    if (newCondition.condition.trim()) {
      setFormData({ ...formData, medicalHistory: [...formData.medicalHistory, { ...newCondition, diagnosedDate: newCondition.diagnosedDate || null }] });
      setNewCondition({ condition: "", diagnosedDate: "", notes: "", status: "Active" });
    }
  };

  const removeMedicalCondition = (index) => {
    setFormData({ ...formData, medicalHistory: formData.medicalHistory.filter((_, i) => i !== index) });
  };

  const addAllergy = () => {
    if (newAllergy.allergen.trim()) {
      setFormData({ ...formData, allergies: [...formData.allergies, { ...newAllergy }] });
      setNewAllergy({ allergen: "", reaction: "", severity: "Moderate" });
    }
  };

  const removeAllergy = (index) => {
    setFormData({ ...formData, allergies: formData.allergies.filter((_, i) => i !== index) });
  };

  const addSurgery = () => {
    if (newSurgery.procedure.trim()) {
      setFormData({ ...formData, surgeries: [...formData.surgeries, { ...newSurgery, date: newSurgery.date || null }] });
      setNewSurgery({ procedure: "", date: "", hospital: "", notes: "" });
    }
  };

  const removeSurgery = (index) => {
    setFormData({ ...formData, surgeries: formData.surgeries.filter((_, i) => i !== index) });
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setFormData({ ...formData, medications: [...formData.medications, { ...newMedication, startDate: newMedication.startDate || null }] });
      setNewMedication({ name: "", dosage: "", frequency: "", startDate: "", prescribedBy: "", status: "Active" });
    }
  };

  const removeMedication = (index) => {
    setFormData({ ...formData, medications: formData.medications.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STRICT VALIDATION LOGIC
    const errors = [];
    
    // 1. Validate Tab 1: Demographics
    if (!formData.name.trim()) errors.push({ msg: "Legal Full Name is required", tab: 1 });
    if (!formData.birthdate) errors.push({ msg: "Birthdate is required", tab: 1 });
    if (!formData.contact.trim()) errors.push({ msg: "Contact Number is required", tab: 1 });
    if (!formData.region.trim()) errors.push({ msg: "Region is required", tab: 1 });
    if (!formData.province.trim()) errors.push({ msg: "Province is required", tab: 1 });
    if (!formData.municipality.trim()) errors.push({ msg: "Municipality is required", tab: 1 });
    if (!formData.barangay.trim()) errors.push({ msg: "Barangay is required", tab: 1 });
    if (!formData.purok.trim()) errors.push({ msg: "Purok/Sitio is required", tab: 1 });
    if (!formData.postalCode.trim()) errors.push({ msg: "Postal Code is required", tab: 1 });
    if (!formData.address.trim()) errors.push({ msg: "Street Address is required", tab: 1 });

    // 2. Validate Tab 2: Clinical Profile
    if (!formData.category) errors.push({ msg: "Patient Category is required", tab: 2 });
    if (!formData.weight.trim()) errors.push({ msg: "Weight is required", tab: 2 });
    if (!formData.height.trim()) errors.push({ msg: "Height is required", tab: 2 });
    if (!formData.bp.trim()) errors.push({ msg: "Blood Pressure is required", tab: 2 });

    // Category-specific strict checks
    if (formData.category === "Prenatal") {
      if (!formData.prenatalGestationalWeek) errors.push({ msg: "Prenatal: Gestational Week required", tab: 2 });
      if (!formData.prenatalTrimester) errors.push({ msg: "Prenatal: Trimester required", tab: 2 });
      if (!formData.prenatalDueDate) errors.push({ msg: "Prenatal: Due Date required", tab: 2 });
      if (!formData.prenatalNextVisitDate) errors.push({ msg: "Prenatal: Next Visit Date required", tab: 2 });
    }

    if (formData.category === "TB DOTS") {
      if (!formData.tbTreatmentStartDate) errors.push({ msg: "TB DOTS: Treatment Start Date required", tab: 2 });
      if (!formData.tbTreatmentPhase) errors.push({ msg: "TB DOTS: Treatment Phase required", tab: 2 });
      if (!formData.tbNextVisitDate) errors.push({ msg: "TB DOTS: Next Visit Date required", tab: 2 });
    }

    if (formData.category === "Pediatric") {
      if (!formData.pediatricBabyFullName.trim()) errors.push({ msg: "Pediatric: Baby Full Name required", tab: 2 });
      if (!formData.pediatricPlaceOfBirth) errors.push({ msg: "Pediatric: Place of Birth required", tab: 2 });
      if (!formData.pediatricBirthWeight.trim()) errors.push({ msg: "Pediatric: Birth Weight required", tab: 2 });
      if (!formData.pediatricDeliveryType) errors.push({ msg: "Pediatric: Type of Delivery required", tab: 2 });
      if (!formData.pediatricBirthStatus) errors.push({ msg: "Pediatric: Birth Status required", tab: 2 });
      if (!formData.pediatricVitaminKGiven) errors.push({ msg: "Pediatric: Vitamin K info required", tab: 2 });
      if (!formData.pediatricEyeOintmentGiven) errors.push({ msg: "Pediatric: Eye Ointment info required", tab: 2 });
      if (!formData.pediatricBreastfeedingStarted) errors.push({ msg: "Pediatric: Breastfeeding info required", tab: 2 });
      if (!formData.pediatricNewbornScreeningDone) errors.push({ msg: "Pediatric: Newborn Screening info required", tab: 2 });
      if (!formData.pediatricBcgGiven) errors.push({ msg: "Pediatric: BCG info required", tab: 2 });
      if (!formData.pediatricHepaBGiven) errors.push({ msg: "Pediatric: Hepatitis B info required", tab: 2 });
      if (!formData.pediatricFirstCheckupDate) errors.push({ msg: "Pediatric: First Check-up Date required", tab: 2 });
      if (!formData.pediatricAssignedHealthWorker.trim()) errors.push({ msg: "Pediatric: Assigned Health Worker required", tab: 2 });
    }

    if (formData.category === "Family Planning") {
      if (!formData.fpMethodChosen) errors.push({ msg: "Family Planning: Method Chosen is required", tab: 2 });
    }

    // 3. Validate Tab 4: Emergency Contact
    if (!formData.emergencyContactName.trim()) errors.push({ msg: "Emergency Contact Name is required", tab: 4 });
    if (!formData.emergencyContactRelation.trim()) errors.push({ msg: "Emergency Contact Relationship is required", tab: 4 });
    if (!formData.emergencyContactPhone.trim()) errors.push({ msg: "Emergency Contact Phone is required", tab: 4 });

    // If there are errors, stop and notify user
    if (errors.length > 0) {
      alert("Registration Incomplete:\n\n" + errors.map(err => `• ${err.msg}`).join("\n"));
      // Automatically switch to the first tab that has an error
      setFormActiveTab(errors[0].tab);
      return;
    }

    const payload = buildPayload();
    console.log("DEBUG: Full payload medicalHistory:", payload.medicalHistory);

    try {
      let response;
      if (isEditing) {
        response = await axios.put(`${API_URL}/${currentPatientId}`, payload);
        fetchPatients();
        setIsModalOpen(false);
        alert("Record updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/add`, payload);
        alert("Patient registered successfully!");
        fetchPatients();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving patient:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save patient record.";
      alert("Error: " + errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to completely remove this patient record from the database?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchPatients();
      } catch (err) {
        console.error("Error deleting patient:", err);
      }
    }
  };

  const sortedAndFilteredPatients = patients
    .filter(p => {
      const matchesSearch = !searchTerm || 
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.barangay?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPurok = filterPurok === "All" || p.purok === filterPurok;
      const matchesBarangay = filterBarangay === "All" || (p.barangay && p.barangay.toLowerCase().includes(filterBarangay.toLowerCase()));
      const matchesCategory = filterCategory === "All" || p.category === filterCategory;
      
      return matchesSearch && matchesPurok && matchesBarangay && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "age") {
        comparison = (Number(a.age) || 0) - (Number(b.age) || 0);
      } else if (sortBy === "lastVisit") {
        comparison = new Date(a.lastVisit || 0) - new Date(b.lastVisit || 0);
      } else if (sortBy === "patientId") {
        comparison = (a.patientId || "").localeCompare(b.patientId || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(sortedAndFilteredPatients.length / itemsPerPage);
  const paginatedPatients = sortedAndFilteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  const getBloodTypeColor = (type) => {
    if (!type || type === 'Unknown') return '#94A3B8';
    if (type.includes('-')) return '#8B5CF6'; // Rare types
    return '#EF4444'; // Common positive types
  };

  const handleExport = () => {
    const headers = ['Patient ID', 'Name', 'Birthdate', 'Age', 'Gender', 'Civil Status', 'Purok', 'Barangay', 'Street Address', 'Category', 'BP', 'Blood Sugar', 'Weight', 'Height', 'Contact', 'Blood Type', 'Last Visit'];
    const rows = sortedAndFilteredPatients.map(p => [
      p.patientId || '',
      p.name || '',
      p.birthdate ? new Date(p.birthdate).toLocaleDateString() : '',
      p.age || '',
      p.gender || '',
      p.civilStatus || '',
      p.purok || '',
      p.barangay || '',
      p.address || '',
      p.category || '',
      p.bp || '',
      p.bloodSugar || '',
      p.weight || '',
      p.height || '',
      p.contact || '',
      p.bloodType || '',
      p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout 
      title="Patient Records" 
      subtitle={`Comprehensive database of ${patients.length} registered patients`}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-button" onClick={fetchPatients} title="Refresh Records" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </button>
          <button className="button button--secondary hide-on-mobile" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
          <button className="button button--primary" onClick={openAddModal} style={{ borderRadius: '12px' }}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Register
          </button>
        </div>
      }
    >
      <style>{`
        .patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .filter-section {
          display: flex;
          gap: 12px;
          align-items: center;
          background: white;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: var(--shadow-sm);
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        }
        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .form-tabs {
          display: flex;
          gap: 4px;
          background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
          padding: 6px;
          border-radius: 14px;
          margin-bottom: 1.5rem;
        }
        .form-tab {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          font-weight: 500;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .form-tab:hover {
          background: rgba(255,255,255,0.5);
          color: #4169E1;
        }
        .form-tab.active {
          background: white;
          color: #4169E1;
          box-shadow: 0 2px 8px rgba(65, 105, 225, 0.15), 0 4px 12px rgba(0,0,0,0.05);
          font-weight: 500;
        }
        .field-input {
          width: 100%;
          padding: 0.875rem;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          outline: none;
          font-weight: 400;
          font-size: 0.9rem;
          transition: all 0.2s;
          background: #FAFBFC;
        }
        .field-input:focus {
          border-color: #4169E1;
          background: white;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.1);
        }
        .field-input::placeholder {
          color: #94A3B8;
        }
        .field-select {
          width: 100%;
          padding: 0.875rem;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          outline: none;
          font-weight: 400;
          font-size: 0.9rem;
          background: #FAFBFC;
          cursor: pointer;
          transition: all 0.2s;
        }
        .field-select:focus {
          border-color: #4169E1;
          background: white;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.1);
        }
        .section-header {
          margin: 0 0 1rem 0;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1E293B;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 0.5rem;
        }
        .data-table-container {
          background: white;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          background: #F8FAFC;
          padding: 1rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 900;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #E2E8F0;
        }
        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #F1F5F9;
          font-size: 0.85rem;
          color: #1E293B;
        }
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .data-table tr:hover td {
          background: #F8FAFC;
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
        }
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: #1E293B;
          color: white;
          font-weight: 600;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .required-mark {
          color: #EF4444;
          margin-left: 2px;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none; }
          .filter-section { flex-direction: column; align-items: stretch; }
          .patients-grid { grid-template-columns: 1fr; }
          .metrics-grid { grid-template-columns: 1fr 1fr; }
          .form-tabs { overflow-x: auto; padding: 10px; gap: 10px; }
          .form-tab { min-width: 120px; }
        }
      `}</style>

      {toast && (
        <div className="toast-notification animate-slide-in-right">
          <FontAwesomeIcon icon={toast.type === 'success' ? faSync : faInfoCircle} />
          {toast.message}
        </div>
      )}

      {/* METRICS DASHBOARD */}
      <section className="metrics-grid animate-fade-in">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>Total Patients</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E293B' }}>{metrics.total}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>Recent (30d)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E293B' }}>{metrics.recent}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#FFF7ED', color: '#F59E0B' }}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>Active Cases</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E293B' }}>{metrics.active}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
            <FontAwesomeIcon icon={faHeartbeat} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>High Risk</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E293B' }}>{metrics.highRisk}</div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS */}
      <section className="animate-fade-in filter-section">
        <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3.25rem', borderRadius: '14px', border: 'none', background: '#F8FAFC', outline: 'none', fontSize: '0.9375rem', fontWeight: 400 }} 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select 
            value={filterCategory} 
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 500, background: 'white' }}
          >
            <option value="All">All Categories</option>
            <option value="OPD">OPD</option>
            <option value="Prenatal">Prenatal</option>
            <option value="TB DOTS">TB DOTS</option>
            <option value="Pediatric">Pediatric</option>
            <option value="Immunization">Immunization</option>
            <option value="NCD">NCD</option>
            <option value="Dental">Dental</option>
            <option value="Family Planning">Family Planning</option>
            <option value="Senior">Senior</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Asthma">Asthma</option>
            <option value="Consultation">Consultation</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 500, background: 'white' }}
          >
            <option value="name">Sort by Name</option>
            <option value="age">Sort by Age</option>
            <option value="patientId">Sort by ID</option>
            <option value="lastVisit">Sort by Last Visit</option>
          </select>

          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="icon-button" 
            style={{ background: 'white', border: '1px solid #E2E8F0', height: '40px', width: '40px' }}
          >
            <FontAwesomeIcon icon={faFilter} style={{ color: '#4169E1' }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginLeft: 'auto' }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#4169E1' : '#94A3B8' }}
          >
            <FontAwesomeIcon icon={faTh} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#4169E1' : '#94A3B8' }}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </section>

      {/* PATIENT LISTING */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <FontAwesomeIcon icon={faSync} spin size="3x" style={{ color: '#E2E8F0' }} />
        </div>
      ) : paginatedPatients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '8rem 0', background: 'white', borderRadius: '24px', border: '1px dashed #CBD5E1' }}>
          <FontAwesomeIcon icon={faUserInjured} size="4x" style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 500, color: '#475569' }}>No matches found</h3>
          <p style={{ margin: 0, color: '#94A3B8' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="patients-grid">
              {paginatedPatients.map(patient => (
                <div 
                  key={patient._id} 
                  className="report-card animate-fade-in hover-reveal" 
                  style={{ padding: '0', background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative' }}
                  onClick={() => setViewPatient(patient)}
                >
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: patient.gender === 'Female' ? '#FDF2F8' : '#EFF6FF', color: patient.gender === 'Female' ? '#EC4899' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        <FontAwesomeIcon icon={faUserInjured} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 500, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {patient.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#64748B' }}>
                            {patient.patientId}
                          </span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }}></span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#4169E1' }}>
                             {patient.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 400, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>Age/Sex</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>{patient.age || '?'}/{patient.gender?.[0] || '?'}</div>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 400, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>Location</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>Purok {patient.purok || '?'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ width: '10px', opacity: 0.7 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.address || 'No address'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                        <FontAwesomeIcon icon={faPhone} style={{ width: '10px', opacity: 0.7 }} />
                        <span>{patient.contact || 'No contact'}</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate("/medical-history", { state: { patientId: patient.patientId, patientData: patient, autoOpen: !hasMedicalRecord(patient.patientId) } }); }}
                        style={{ flex: 1, padding: '9px', borderRadius: '10px', background: hasMedicalRecord(patient.patientId) ? '#4169E1' : '#F8FAFC', color: hasMedicalRecord(patient.patientId) ? 'white' : '#4169E1', border: hasMedicalRecord(patient.patientId) ? 'none' : '1px solid #E2E8F0', fontSize: '0.65rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <FontAwesomeIcon icon={hasMedicalRecord(patient.patientId) ? faNotesMedical : faPlus} />
                        {hasMedicalRecord(patient.patientId) ? 'HISTORY' : 'ADD RECORD'}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FontAwesomeIcon icon={faEdit} size="sm" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(patient._id); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="data-table-container animate-fade-in">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Full Name</th>
                    <th className="hide-on-mobile">Age / Sex</th>
                    <th className="hide-on-mobile">Location</th>
                    <th>Category</th>
                    <th className="hide-on-mobile">Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map(patient => (
                    <tr key={patient._id} onClick={() => setViewPatient(patient)} style={{ cursor: 'pointer' }}>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#4169E1', background: '#EFF6FF', padding: '4px 8px', borderRadius: '6px' }}>
                          {patient.patientId}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: '#1E293B' }}>{patient.name}</div>
                      </td>
                      <td className="hide-on-mobile">
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}>
                          {patient.age || '?'} yrs • {patient.gender === 'Female' ? 'F' : 'M'}
                        </div>
                      </td>
                      <td className="hide-on-mobile">
                        <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748B' }}>
                          P{patient.purok}, {patient.barangay}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#8B5CF6', background: '#F5F3FF', padding: '4px 10px', borderRadius: '999px', border: '1px solid #DDD6FE' }}>
                          {patient.category}
                        </span>
                      </td>
                      <td className="hide-on-mobile">
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94A3B8' }}>
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditModal(patient)} className="icon-button" style={{ background: '#F1F5F9', color: '#4169E1', width: '32px', height: '32px' }}><FontAwesomeIcon icon={faEdit} size="sm" /></button>
                          <button onClick={() => handleDelete(patient._id)} className="icon-button" style={{ background: '#FEF2F2', color: '#EF4444', width: '32px', height: '32px' }}><FontAwesomeIcon icon={faTrash} size="sm" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination-container animate-fade-in">
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}>Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, sortedAndFilteredPatients.length)} of {sortedAndFilteredPatients.length}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 500, cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: currentPage === i + 1 ? '#4169E1' : 'transparent', color: currentPage === i + 1 ? 'white' : '#64748B', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 500, cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* REGISTRATION / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '1rem' }}>
          <div className="report-card animate-scale-in" style={{ width: '100%', maxWidth: '850px', padding: '0', borderRadius: '28px', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #4169E1, #1E40AF)', padding: '1.5rem 2rem', color: 'white', position: 'relative', flexShrink: 0 }}>
               <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 500 }}>{isEditing ? 'Update Patient File' : 'Register New Patient'}</h2>
               <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>System ID: {formData.patientId} • Integrated Health Record</p>
               <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
            </div>

            <div style={{ padding: '1rem 2rem 0', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
               <div className="form-tabs">
                  <button type="button" className={`form-tab ${formActiveTab === 1 ? 'active' : ''}`} onClick={() => setFormActiveTab(1)}>
                    <FontAwesomeIcon icon={faIdCard} /> Demographics
                  </button>
                  <button type="button" className={`form-tab ${formActiveTab === 2 ? 'active' : ''}`} onClick={() => setFormActiveTab(2)}>
                    <FontAwesomeIcon icon={faHeartbeat} /> Clinical Profile
                  </button>
                  <button type="button" className={`form-tab ${formActiveTab === 3 ? 'active' : ''}`} onClick={() => setFormActiveTab(3)}>
                    <FontAwesomeIcon icon={faNotesMedical} /> Medical History
                  </button>
                  <button type="button" className={`form-tab ${formActiveTab === 4 ? 'active' : ''}`} onClick={() => setFormActiveTab(4)}>
                    <FontAwesomeIcon icon={faPhone} /> Emergency Contact
                  </button>
               </div>
            </div>
            
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSubmit}>
                
                {/* TAB 1: DEMOGRAPHICS */}
                {formActiveTab === 1 && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #EFF6FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faIdCard} /> Primary Information
                      </h4>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Legal Full Name <span className="required-mark">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          required 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange}
                          onFocus={() => formData.name.length >= 2 && setShowSuggestions(searchSuggestions.length > 0)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          style={{ width: '100%', padding: '0.75rem 1rem', paddingRight: formData.name ? '3rem' : '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.95rem', boxSizing: 'border-box' }} 
                          placeholder="Search or enter full name"
                          />
                          {formData.name && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(getInitialFormData(formData.patientId));
                              setSearchSuggestions([]);
                              setShowSuggestions(false);
                            }}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '22px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <FontAwesomeIcon icon={faTimes} style={{ fontSize: '0.65rem', color: '#94A3B8' }} />
                          </button>
                          )}

                          {/* Advanced Search Suggestions Dropdown */}
                          {showSuggestions && searchSuggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 100, marginTop: '5px', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9', fontSize: '0.65rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                              Found in Residents & Patients
                            </div>
                            {searchSuggestions.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent onBlur from hiding list before click
                                    selectSuggestion(item);
                                  }}
                                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: idx === searchSuggestions.length - 1 ? 'none' : '1px solid #F1F5F9', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#F0F9FF'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.source === 'resident' ? '#F0FDF4' : '#EFF6FF', color: item.source === 'resident' ? '#16A34A' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                  <FontAwesomeIcon icon={item.source === 'resident' ? faUsers : faUserInjured} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                    {item.source === 'resident' ? `Resident ID: ${item.residentId}` : `Patient ID: ${item.patientId}`} • {item.age} yrs • {item.gender}
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: item.source === 'resident' ? '#16A34A' : '#3B82F6', background: item.source === 'resident' ? '#DCFCE7' : '#DBEAFE', padding: '2px 8px', borderRadius: '4px' }}>
                                  {item.source === 'resident' ? 'CENSUS' : 'PATIENT'}
                                </div>
                              </div>
                            ))}
                          </div>
                          )}                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Birthdate <span className="required-mark">*</span></label>
                        <input required type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.9rem', boxSizing: 'border-box' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Age <span className="required-mark">*</span></label>
                          <input required readOnly name="age" value={formData.age} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 400, background: '#F8FAFC', color: '#4169E1', boxSizing: 'border-box' }} placeholder="Auto" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Gender <span className="required-mark">*</span></label>
                          <select required name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.9rem', boxSizing: 'border-box' }}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Civil Status <span className="required-mark">*</span></label>
                        <select required name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.9rem', boxSizing: 'border-box' }}>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Separated">Separated</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>Contact Number <span className="required-mark">*</span></label>
                        <input required name="contact" value={formData.contact} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="09XX XXX XXXX" />
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 400, color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F0F9FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Address Information <span className="required-mark">*</span>
                      </h5>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Region <span className="required-mark">*</span></label>
                        <input required name="region" value={formData.region} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="e.g. Region 11" />
                      </div>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Province <span className="required-mark">*</span></label>
                        <input required name="province" value={formData.province} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Province" />
                      </div>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Municipality/City <span className="required-mark">*</span></label>
                        <input required name="municipality" value={formData.municipality} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Municipality/City" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Barangay <span className="required-mark">*</span></label>
                        <input required name="barangay" value={formData.barangay} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Barangay" />
                      </div>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Purok/Sitio <span className="required-mark">*</span></label>
                        <input required name="purok" value={formData.purok} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Purok/Sitio" />
                      </div>
                      <div style={{ width: '100%' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Postal Code <span className="required-mark">*</span></label>
                        <input required name="postalCode" value={formData.postalCode} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="Postal Code" />
                      </div>
                    </div>

                    <div style={{ width: '100%' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '6px' }}>Street Address / Landmark <span className="required-mark">*</span></label>
                      <input required name="address" value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, fontSize: '0.85rem', boxSizing: 'border-box' }} placeholder="House No., Street Name, Landmark" />
                    </div>
                  </div>
                )}

                {/* TAB 2: CLINICAL PROFILE */}
                {formActiveTab === 2 && (
                  <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #F5F3FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faHeartbeat} /> CLINICAL DATA & CLASSIFICATION
                      </h4>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>PATIENT CATEGORY <span className="required-mark">*</span></label>
                      <select required name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500, color: '#1E293B', background: '#FAFBFC' }}>
                        <option value="" disabled>-- Select Patient Category --</option>
                        <option value="Prenatal">Prenatal (Maternal Care)</option>
                        <option value="TB DOTS">TB DOTS (Respiratory)</option>
                        <option value="Pediatric">Pediatric (Child Care)</option>
                        <option value="Immunization">Immunization (Vaccination)</option>
                        <option value="Dental">Dental (Oral Care)</option>
                        <option value="Family Planning">Family Planning</option>
                        <option value="Senior">Senior (Elderly Care)</option>
                        <option value="Hypertension">Hypertension (BP Management)</option>
                        <option value="Diabetes">Diabetes (Sugar Management)</option>
                        <option value="Asthma">Asthma (Respiratory)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>BLOOD TYPE</label>
                        <select name="bloodType" value={formData.bloodType} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 400, background: '#FAFBFC' }}>
                          <option value="Unknown">Unknown</option>
                          <option value="A+">A+</option><option value="A-">A-</option>
                          <option value="B+">B+</option><option value="B-">B-</option>
                          <option value="O+">O+</option><option value="O-">O-</option>
                          <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>WEIGHT (kg) <span className="required-mark">*</span></label>
                        <input required name="weight" value={formData.weight} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 400, background: '#FAFBFC' }} placeholder="kg" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>HEIGHT (cm) <span className="required-mark">*</span></label>
                        <input required name="height" value={formData.height} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 400, background: '#FAFBFC' }} placeholder="cm" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>BLOOD PRESSURE <span className="required-mark">*</span></label>
                        <input required name="bp" value={formData.bp} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 400, background: '#FAFBFC' }} placeholder="120/80" />
                      </div>
                    </div>

                    {formData.category === 'Hypertension' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>BP MANAGEMENT DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BLOOD PRESSURE (mmHg)</label>
                          <input name="hypBloodPressure" value={formData.hypBloodPressure} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 150/95" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PULSE RATE (bpm)</label>
                          <input type="number" name="hypPulseRate" value={formData.hypPulseRate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 88" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>WEIGHT (kg)</label>
                          <input type="number" name="hypWeight" value={formData.hypWeight} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 72" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BMI (Auto-calculated)</label>
                          <input disabled value={formData.hypWeight && formData.height ? (parseFloat(formData.hypWeight) / Math.pow(parseFloat(formData.height)/100, 2)).toFixed(1) : ""} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F1F5F9' }} placeholder="Auto-calculated" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>MAINTENANCE MEDICATION</label>
                          <input name="hypMedication" value={formData.hypMedication} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Losartan 50mg" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>SMOKING STATUS</label>
                          <select name="hypSmokingStatus" value={formData.hypSmokingStatus} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Non-Smoker", "Former Smoker", "Active Smoker"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>COMPLICATIONS (Multi-select)</label>
                          <input name="hypComplications" value={formData.hypComplications} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Stroke, Heart Disease" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT BP CHECK</label>
                          <input type="date" name="hypNextCheck" value={formData.hypNextCheck} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DOCTOR NOTES</label>
                          <textarea name="hypDoctorNotes" value={formData.hypDoctorNotes} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Monitor BP twice daily" />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Asthma' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>ASTHMA MONITORING</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ASTHMA SEVERITY</label>
                          <select name="asthmaSeverity" value={formData.asthmaSeverity} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Intermittent", "Mild Persistent", "Moderate Persistent", "Severe Persistent"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PEAK FLOW READING (L/min)</label>
                          <input type="number" name="asthmaPeakFlow" value={formData.asthmaPeakFlow} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 320" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>OXYGEN SATURATION (%)</label>
                          <input type="number" name="asthmaOxygenSat" value={formData.asthmaOxygenSat} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 96" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEBULIZATION GIVEN</label>
                          <select name="asthmaNebulization" value={formData.asthmaNebulization} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Yes", "No"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>EMERGENCY EPISODES</label>
                          <input type="number" name="asthmaEmergency" value={formData.asthmaEmergency} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 2" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>SMOKING EXPOSURE</label>
                          <select name="asthmaSmoking" value={formData.asthmaSmoking} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Yes", "No"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>TRIGGERS (Multi-select)</label>
                          <input name="asthmaTriggers" value={formData.asthmaTriggers} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Dust, Smoke, Cold Weather" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BREATHING ASSESSMENT</label>
                          <textarea name="asthmaAssessment" value={formData.asthmaAssessment} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Mild wheezing" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>CURRENT MEDICATION</label>
                          <input name="asthmaMedication" value={formData.asthmaMedication} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Salbutamol Inhaler" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ALLERGY HISTORY</label>
                          <textarea name="asthmaAllergy" value={formData.asthmaAllergy} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Allergic to pollen" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>FOLLOW-UP DATE</label>
                          <input type="date" name="asthmaFollowUp" value={formData.asthmaFollowUp} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>REMARKS</label>
                          <textarea name="asthmaRemarks" value={formData.asthmaRemarks} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Avoid smoke exposure" />
                        </div>
                      </div>
                    )}
                    {formData.category === 'Immunization' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>IMMUNIZATION DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>VACCINE TYPE <span className="required-mark">*</span></label>
                          <select required name="immVaccineType" value={formData.immVaccineType} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Vaccine --</option>
                            {["BCG", "Hepatitis B", "Pentavalent", "OPV", "IPV", "MMR", "PCV", "Rotavirus", "COVID-19", "Influenza", "HPV", "Tetanus Toxoid", "Anti-Rabies", "Vitamin A"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DOSE NUMBER <span className="required-mark">*</span></label>
                          <select required name="immDoseNumber" value={formData.immDoseNumber} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Dose --</option>
                            {["Dose 1", "Dose 2", "Dose 3", "Booster 1", "Booster 2", "Single Dose"].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DATE ADMINISTERED <span className="required-mark">*</span></label>
                          <input required type="date" name="immDateAdministered" value={formData.immDateAdministered} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BATCH/LOT NUMBER</label>
                          <input name="immBatchLot" value={formData.immBatchLot} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. LOT-BCG-2026-019" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>VACCINATOR</label>
                          <input name="immVaccinator" value={formData.immVaccinator} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="Name or title" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>INJECTION SITE</label>
                          <select name="immInjectionSite" value={formData.immInjectionSite} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Site --</option>
                            {["Left Arm", "Right Arm", "Left Thigh", "Right Thigh", "Oral", "Intranasal"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT DOSE SCHEDULE</label>
                          <input type="date" name="immNextDoseDate" value={formData.immNextDoseDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ADVERSE REACTION</label>
                          <input name="immAdverseReaction" value={formData.immAdverseReaction} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="None, Fever, Swelling, etc." />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>IMMUNIZATION STATUS</label>
                          <select name="immStatus" value={formData.immStatus} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Status --</option>
                            {["Completed", "Pending", "Overdue", "Partially Vaccinated", "Deferred", "Contraindicated"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>REMARKS</label>
                          <textarea name="immRemarks" value={formData.immRemarks} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="Patient tolerated vaccine well." />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Dental' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>DENTAL EXAMINATION</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>CHIEF DENTAL COMPLAINT</label>
                          <input name="dentalChiefComplaint" value={formData.dentalChiefComplaint} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Toothache" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>AFFECTED TOOTH</label>
                          <select name="dentalAffectedTooth" value={formData.dentalAffectedTooth} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Tooth --</option>
                            {[...Array(32).keys()].map(i => <option key={i+1} value={`Tooth #${i+1}`}>Tooth #{i+1}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DENTAL CHART STATUS</label>
                          <select name="dentalChart" value={formData.dentalChart} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Status --</option>
                            {["Decayed", "Missing", "Filled"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PROCEDURE NEEDED (Multi-select)</label>
                          <input name="dentalProcedureNeeded" value={formData.dentalProcedureNeeded} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Cleaning, Extraction" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ORAL EXAMINATION</label>
                          <textarea name="dentalOralExamination" value={formData.dentalOralExamination} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Swollen gums..." />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ORAL HYGIENE ADVICE</label>
                          <textarea name="dentalOralHygieneAdvice" value={formData.dentalOralHygieneAdvice} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Brush twice daily" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT DENTAL VISIT</label>
                          <input type="date" name="dentalNextVisit" value={formData.dentalNextVisit} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DENTIST NOTES</label>
                          <textarea name="dentalDentistNotes" value={formData.dentalDentistNotes} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Follow-up after extraction" />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Senior' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>SENIOR CARE DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>MOBILITY STATUS</label>
                          <select name="seniorMobilityStatus" value={formData.seniorMobilityStatus} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Independent", "Assisted", "Bedridden"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>COGNITIVE ASSESSMENT</label>
                          <select name="seniorCognitiveAssessment" value={formData.seniorCognitiveAssessment} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Normal", "Mild Impairment", "Dementia"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>VISION ASSESSMENT</label>
                          <select name="seniorVision" value={formData.seniorVision} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Normal", "Blurred Vision", "Cataract"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>HEARING ASSESSMENT</label>
                          <select name="seniorHearing" value={formData.seniorHearing} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Normal", "Partial Hearing Loss"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>FALL RISK</label>
                          <select name="seniorFallRisk" value={formData.seniorFallRisk} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Low", "Moderate", "High"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NUTRITION ASSESSMENT</label>
                          <select name="seniorNutrition" value={formData.seniorNutrition} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            {["Normal", "Underweight", "Malnourished"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>MAINTENANCE MEDICATION</label>
                          <input name="seniorMedications" value={formData.seniorMedications} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Amlodipine 5mg" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>CHRONIC CONDITIONS (Multi-select)</label>
                          <input name="seniorChronicConditions" value={formData.seniorChronicConditions} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Hypertension, Diabetes" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>VACCINATION STATUS (Multi-select)</label>
                          <input name="seniorVaccinations" value={formData.seniorVaccinations} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Flu Vaccine, Pneumococcal" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>CAREGIVER INFORMATION</label>
                          <input name="seniorCaregiverInfo" value={formData.seniorCaregiverInfo} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Maria Santos (Daughter)" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>FOLLOW-UP DATE</label>
                          <input type="date" name="seniorFollowUpDate" value={formData.seniorFollowUpDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>MENTAL HEALTH NOTES</label>
                          <textarea name="seniorMentalHealthNotes" value={formData.seniorMentalHealthNotes} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Occasional forgetfulness" />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Prenatal' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>PRENATAL CARE DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>GESTATIONAL WEEK</label>
                          <input type="number" name="prenatalGestationalWeek" value={formData.prenatalGestationalWeek || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>TRIMESTER</label>
                          <select name="prenatalTrimester" value={formData.prenatalTrimester || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            <option value="1st Trimester">1st Trimester</option>
                            <option value="2nd Trimester">2nd Trimester</option>
                            <option value="3rd Trimester">3rd Trimester</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>DUE DATE (EDC)</label>
                          <input type="date" name="prenatalDueDate" value={formData.prenatalDueDate || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>RISK LEVEL</label>
                          <select name="prenatalRiskLevel" value={formData.prenatalRiskLevel || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select --</option>
                            <option value="Low Risk">Low Risk</option>
                            <option value="Moderate Risk">Moderate Risk</option>
                            <option value="High Risk">High Risk</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT VISIT DATE</label>
                          <input type="date" name="prenatalNextVisitDate" value={formData.prenatalNextVisitDate || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                      </div>
                    )}

                    {formData.category === 'TB DOTS' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>TB DOTS PROGRAM DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>START DATE <span className="required-mark">*</span></label>
                          <input type="date" name="tbTreatmentStartDate" value={formData.tbTreatmentStartDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PHASE <span className="required-mark">*</span></label>
                          <select name="tbTreatmentPhase" value={formData.tbTreatmentPhase} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                            <option value="">-- Select --</option>
                            <option value="Intensive">Intensive Phase</option>
                            <option value="Continuation">Continuation Phase</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>REGIMEN</label>
                          <input name="tbRegimen" value={formData.tbRegimen} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="Regimen type" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT VISIT DATE <span className="required-mark">*</span></label>
                          <input type="date" name="tbNextVisitDate" value={formData.tbNextVisitDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Family Planning' && (
                      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', fontWeight: 400, color: '#4169E1', marginBottom: '0.5rem' }}>FAMILY PLANNING DETAILS</div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>METHOD CHOSEN <span className="required-mark">*</span></label>
                          <select name="fpMethodChosen" value={formData.fpMethodChosen} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Method --</option>
                            {["Pills", "Condom", "IUD", "Implant", "Injectable", "Natural Method"].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PREVIOUS METHOD</label>
                          <select name="fpPreviousMethod" value={formData.fpPreviousMethod} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                            <option value="">-- Select Method --</option>
                            {["None", "Pills", "Injectable"].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BLOOD PRESSURE (mmHg)</label>
                          <input name="fpBloodPressure" value={formData.fpBloodPressure} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 120/80" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>WEIGHT (kg)</label>
                          <input type="number" name="fpWeight" value={formData.fpWeight} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. 58" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PREGNANCY HISTORY (e.g. G2P2)</label>
                          <textarea name="fpPregnancyHistory" value={formData.fpPregnancyHistory} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>MENSTRUAL HISTORY</label>
                          <textarea name="fpMenstrualHistory" value={formData.fpMenstrualHistory} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>COUNSELING PROVIDED (Multi-select)</label>
                          <input name="fpCounselingProvided" value={formData.fpCounselingProvided} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Birth Spacing, Side Effects" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>SIDE EFFECTS (Multi-select)</label>
                          <input name="fpSideEffects" value={formData.fpSideEffects} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. Spotting, Headache" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEXT RESUPPLY DATE</label>
                          <input type="date" name="fpNextResupplyDate" value={formData.fpNextResupplyDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>FOLLOW-UP VISIT</label>
                          <input type="date" name="fpFollowUpDate" value={formData.fpFollowUpDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>REMARKS</label>
                          <textarea name="fpRemarks" value={formData.fpRemarks} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '60px' }} placeholder="e.g. Patient prefers injectable method" />
                        </div>
                      </div>
                    )}

                    {formData.category === 'Pediatric' && (
                      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        
                        {/* Basic Baby Information */}
                        <div style={{ borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faBaby} /> Basic Baby Information
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BABY FULL NAME <span className="required-mark">*</span></label>
                              <input required name="pediatricBabyFullName" value={formData.pediatricBabyFullName} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="Enter baby full name" />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>TIME OF BIRTH</label>
                              <input name="pediatricTimeOfBirth" value={formData.pediatricTimeOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="e.g. 08:30 AM" />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>SEX <span className="required-mark">*</span></label>
                              <select required name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>PLACE OF BIRTH <span className="required-mark">*</span></label>
                              <select required name="pediatricPlaceOfBirth" value={formData.pediatricPlaceOfBirth} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="Home">Home</option>
                                <option value="Hospital">Hospital</option>
                                <option value="Lying-in clinic">Lying-in clinic</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Birth Details */}
                        <div style={{ borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faBaby} /> Birth Details
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BIRTH WEIGHT <span className="required-mark">*</span></label>
                              <input required name="pediatricBirthWeight" value={formData.pediatricBirthWeight} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="e.g. 3.2 kg" />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BIRTH LENGTH (cm)</label>
                              <input name="pediatricBirthLength" value={formData.pediatricBirthLength} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="Optional" />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>TYPE OF DELIVERY <span className="required-mark">*</span></label>
                              <select required name="pediatricDeliveryType" value={formData.pediatricDeliveryType} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="Normal (NSD)">Normal (NSD)</option>
                                <option value="Cesarean (CS)">Cesarean (CS)</option>
                                <option value="Assisted">Assisted</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>WAS THE BABY <span className="required-mark">*</span></label>
                              <select required name="pediatricBirthStatus" value={formData.pediatricBirthStatus} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="Alive at birth">Alive at birth</option>
                                <option value="Stillbirth">Stillbirth</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ANY COMPLICATIONS? <span className="required-mark">*</span></label>
                              <select required name="pediatricHasComplications" value={formData.pediatricHasComplications} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>
                          {formData.pediatricHasComplications === 'Yes' && (
                            <div style={{ marginTop: '1rem' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>COMPLICATIONS NOTES</label>
                              <textarea name="pediatricComplicationsNotes" value={formData.pediatricComplicationsNotes} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500, minHeight: '60px' }} placeholder="Add notes if there were complications" />
                            </div>
                          )}
                        </div>

                        {/* Newborn Health & Interventions */}
                        <div style={{ borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faBaby} /> Newborn Health & Interventions
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>VITAMIN K GIVEN? <span className="required-mark">*</span></label>
                              <select required name="pediatricVitaminKGiven" value={formData.pediatricVitaminKGiven} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>EYE OINTMENT GIVEN? <span className="required-mark">*</span></label>
                              <select required name="pediatricEyeOintmentGiven" value={formData.pediatricEyeOintmentGiven} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BREASTFEEDING STARTED? <span className="required-mark">*</span></label>
                              <select required name="pediatricBreastfeedingStarted" value={formData.pediatricBreastfeedingStarted} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>NEWBORN SCREENING? <span className="required-mark">*</span></label>
                              <select required name="pediatricNewbornScreeningDone" value={formData.pediatricNewbornScreeningDone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <option value="">-- Select --</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                                <option value="Planned">Planned</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Immunization */}
                        <div style={{ borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faSyringe} /> Immunization
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BCG GIVEN? <span className="required-mark">*</span></label>
                                <select required name="pediatricBcgGiven" value={formData.pediatricBcgGiven} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                  <option value="">-- Select --</option>
                                  <option value="No">No</option>
                                  <option value="Yes">Yes</option>
                                </select>
                              </div>
                              {formData.pediatricBcgGiven === 'Yes' && (
                                <div style={{ flex: 1.5 }}>
                                  <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>BCG DATE</label>
                                  <input type="date" name="pediatricBcgDate" value={formData.pediatricBcgDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} />
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>HEP B GIVEN? <span className="required-mark">*</span></label>
                                <select required name="pediatricHepaBGiven" value={formData.pediatricHepaBGiven} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }}>
                                  <option value="">-- Select --</option>
                                  <option value="No">No</option>
                                  <option value="Yes">Yes</option>
                                </select>
                              </div>
                              {formData.pediatricHepaBGiven === 'Yes' && (
                                <div style={{ flex: 1.5 }}>
                                  <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>HEP B DATE</label>
                                  <input type="date" name="pediatricHepaBDate" value={formData.pediatricHepaBDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Follow-Up / Tracking Info */}
                        <div>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Follow-Up / Tracking Info
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>FIRST CHECK-UP DATE <span className="required-mark">*</span></label>
                              <input required type="date" name="pediatricFirstCheckupDate" value={formData.pediatricFirstCheckupDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>ASSIGNED HEALTH WORKER <span className="required-mark">*</span></label>
                              <input required name="pediatricAssignedHealthWorker" value={formData.pediatricAssignedHealthWorker} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500 }} placeholder="Name or barangay" />
                            </div>
                          </div>
                          <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 400, color: '#64748B' }}>REMARKS</label>
                            <textarea name="pediatricRemarks" value={formData.pediatricRemarks} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 500, minHeight: '60px' }} placeholder="Add monitoring notes" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: MEDICAL HISTORY */}
                {formActiveTab === 3 && (
                  <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #EFF6FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faNotesMedical} /> MEDICAL HISTORY & CONDITIONS
                      </h4>
                      <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                           <input placeholder="Condition name" value={newCondition.condition} onChange={(e) => setNewCondition({...newCondition, condition: e.target.value})} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <input type="date" value={newCondition.diagnosedDate} onChange={(e) => setNewCondition({...newCondition, diagnosedDate: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <button type="button" onClick={addMedicalCondition} style={{ padding: '10px 20px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                           {formData.medicalHistory.map((item, idx) => (
                             <div key={idx} style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10B981' }} />
                                <span>{item.condition}</span>
                                <FontAwesomeIcon icon={faTimes} style={{ color: '#EF4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => removeMedicalCondition(idx)} />
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #EFF6FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faAllergies} /> ALLERGIES
                      </h4>
                      <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                           <input placeholder="Allergen" value={newAllergy.allergen} onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <input placeholder="Reaction" value={newAllergy.reaction} onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <button type="button" onClick={addAllergy} style={{ padding: '10px 20px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                           {formData.allergies.map((item, idx) => (
                             <div key={idx} style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#EF4444' }} />
                                <span>{item.allergen}</span>
                                <FontAwesomeIcon icon={faTimes} style={{ color: '#EF4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => removeAllergy(idx)} />
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #EFF6FF', paddingBottom: '0.5rem' }}>
                        <FontAwesomeIcon icon={faPills} /> CURRENT MEDICATIONS
                      </h4>
                      <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                           <input placeholder="Medication name" value={newMedication.name} onChange={(e) => setNewMedication({...newMedication, name: e.target.value})} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <input placeholder="Dosage" value={newMedication.dosage} onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                           <button type="button" onClick={addMedication} style={{ padding: '10px 20px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                           {formData.medications.map((item, idx) => (
                             <div key={idx} style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <FontAwesomeIcon icon={faPills} style={{ color: '#4169E1' }} />
                                <span>{item.name} ({item.dosage})</span>
                                <FontAwesomeIcon icon={faTimes} style={{ color: '#EF4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => removeMedication(idx)} />
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: EMERGENCY CONTACT */}
                {formActiveTab === 4 && (
                  <div className="animate-fade-in">
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #EFF6FF', paddingBottom: '0.5rem' }}>
                      <FontAwesomeIcon icon={faPhone} /> EMERGENCY CONTACT INFORMATION <span className="required-mark">*</span>
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>CONTACT PERSON NAME <span className="required-mark">*</span></label>
                        <input required name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500 }} placeholder="Full Name" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>RELATIONSHIP <span className="required-mark">*</span></label>
                        <input required name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleInputChange} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500 }} placeholder="e.g. Spouse" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '8px' }}>PHONE NUMBER <span className="required-mark">*</span></label>
                        <input required name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 500 }} placeholder="09XX XXX XXXX" />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1', marginTop: '2rem', display: 'flex', gap: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '2rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="button button--secondary" style={{ flex: 1, padding: '1.25rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 500 }}>Cancel</button>
                  <button type="submit" className="button button--primary" style={{ flex: 2, padding: '1.25rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 400, boxShadow: '0 10px 15px -3px rgba(65, 105, 225, 0.3)' }}>
                    {isEditing ? 'UPDATE COMPLETE RECORD' : 'SAVE & REGISTER PATIENT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL (UNCHANGED BUT RESPONSIVE) */}
      {viewPatient && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '1rem' }}>
          <div className="report-card animate-scale-in" style={{ width: '100%', maxWidth: '550px', padding: '0', borderRadius: '24px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #4169E1, #1E40AF)', padding: '1.5rem', color: 'white', position: 'relative' }}>
              <button onClick={() => setViewPatient(null)} style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 400 }}>{viewPatient.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.8 }}>{viewPatient.patientId} • {viewPatient.category}</p>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, color: '#94A3B8' }}>PERSONAL INFO</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 500 }}>{viewPatient.age} yrs • {viewPatient.gender}</p>
                </div>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, color: '#94A3B8' }}>BLOOD TYPE</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 500, color: '#EF4444' }}>{viewPatient.bloodType || 'Unknown'}</p>
                </div>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, color: '#94A3B8' }}>ADDRESS & CONTACT</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 500 }}>{viewPatient.address || 'N/A'}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 500 }}>{viewPatient.contact || 'N/A'}</p>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => { setViewPatient(null); navigate("/medical-history", { state: { patientId: viewPatient.patientId, patientData: viewPatient } }); }} 
                  style={{ padding: '1rem', borderRadius: '14px', background: '#EFF6FF', color: '#4169E1', border: '1px solid #4169E1', fontWeight: 500, cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faNotesMedical} style={{ marginRight: '8px' }} /> VIEW MEDICAL HISTORY
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setViewPatient(null); openEditModal(viewPatient); }} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: '#F1F5F9', border: 'none', color: '#1E293B', fontWeight: 500, cursor: 'pointer' }}>Edit Details</button>
                  <button onClick={() => setViewPatient(null)} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'white', border: '1px solid #E2E8F0', color: '#64748B', fontWeight: 500, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
