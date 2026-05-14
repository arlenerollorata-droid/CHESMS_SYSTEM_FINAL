import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faSearch, 
  faUserInjured, 
  faCalendarAlt,
  faFilter,
  faTimes,
  faEye,
  faStethoscope,
  faPills,
  faSyringe,
  faVial,
  faUsers,
  faFileMedical,
  faPlus,
  faSync,
  faHeartbeat
} from "@fortawesome/free-solid-svg-icons"
import PatientRecordProfile from "../features/medical-history/PatientRecordProfile"
import axios from "axios"

const API_BASE = window.location.hostname === 'localhost' ? "http://localhost:5000/api" : `http://${window.location.hostname}:5000/api`
const RESIDENTS_API = `${API_BASE}/residents`
const RECORDS_API = `${API_BASE}/records`

const formatResidentName = (resident) => [resident.firstName, resident.middleName, resident.lastName, resident.suffix].filter(Boolean).join(' ').trim()
const getInitials = (value) => (value || '')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || 'MR'

const normalizeCaseId = (rawId) => {
  const value = (rawId || "opd").toString().trim().toLowerCase();
  if (value === "tb dots" || value === "tb-dots" || value === "tuberculosis" || value === "tb") return "tb";
  if (value === "pediatric" || value === "child care" || value === "childcare" || value === "pediatrics") return "pediatric";
  if (value === "immunization" || value === "vaccination") return "immunization";
  if (value === "family planning" || value === "familyplanning") return "familyplanning";
  if (value === "general" || value === "general opd" || value === "opd") return "opd";
  if (value === "prenatal") return "prenatal";
  if (value === "ncd") return "ncd";
  if (value === "dental") return "dental";
  if (value === "senior") return "senior";
  return value;
};

const mergeNormalizedEntries = (left = [], right = [], prefix) => {
  const byId = new Map()
  normalizeEntries(left, prefix).forEach((item) => {
    byId.set(item.id, item)
  })
  normalizeEntries(right, prefix).forEach((item) => {
    byId.set(item.id, item)
  })
  return Array.from(byId.values())
}

const isCaseEmpty = (caseItem) => {
  const records = caseItem?.records || {}
  return Object.values(records).every((value) => !Array.isArray(value) || value.length === 0)
}

const normalizeEntries = (entries, prefix) => (Array.isArray(entries) ? entries : []).map((entry, index) => {
  if (typeof entry === 'string') {
    return {
      id: `${prefix}-${index}`,
      label: entry,
      value: entry,
      ...(prefix === 'TM' ? { trimester: entry } : {})
    }
  }

  return {
    ...entry,
    id: entry.id || entry._id || `${prefix}-${index}`
  }
})

const normalizeCaseRecords = (cases) => {
  if (!Array.isArray(cases)) return []
  return cases.map(caseItem => ({
    ...caseItem,
    id: normalizeCaseId(caseItem.id),
    records: {
      consultations: normalizeEntries(caseItem.records?.consultations || [], 'CON'),
      prescriptions: normalizeEntries(caseItem.records?.prescriptions || [], 'PRE'),
      labResults: normalizeEntries(caseItem.records?.labResults || [], 'LAB'),
      immunizations: normalizeEntries(caseItem.records?.immunizations || [], 'IMM'),
      referrals: normalizeEntries(caseItem.records?.referrals || [], 'REF'),
      sputum: normalizeEntries(caseItem.records?.sputum || [], 'SPT'),
      xray: normalizeEntries(caseItem.records?.xray || [], 'XRAY'),
      adherence: normalizeEntries(caseItem.records?.adherence || [], 'ADH'),
      treatment: normalizeEntries(caseItem.records?.treatment || [], 'TRT'),
      followup: normalizeEntries(caseItem.records?.followup || [], 'FUP'),
      ultrasound: normalizeEntries(caseItem.records?.ultrasound || [], 'US'),
      trimester: normalizeEntries(caseItem.records?.trimester || [], 'TM'),
      maternal: normalizeEntries(caseItem.records?.maternal || [], 'MAT'),
      bpMonitoring: normalizeEntries(caseItem.records?.bpMonitoring || [], 'BPM'),
      medication: normalizeEntries(caseItem.records?.medication || [], 'MED'),
      glucose: normalizeEntries(caseItem.records?.glucose || [], 'GLU'),
      complications: normalizeEntries(caseItem.records?.complications || [], 'CMP'),
      growth: normalizeEntries(caseItem.records?.growth || [], 'GRW'),
      development: normalizeEntries(caseItem.records?.development || [], 'DEV')
    }
  }))
}

const normalizeRecord = (record) => {
  let normalizedCases = normalizeCaseRecords(record.cases || []);

  // Merge duplicate cases (for example OPD/opd) into a single case bucket.
  const dedupedCases = new Map();
  normalizedCases.forEach((caseItem) => {
    const caseId = normalizeCaseId(caseItem.id);
    const existing = dedupedCases.get(caseId);
    if (!existing) {
      dedupedCases.set(caseId, {
        ...caseItem,
        id: caseId,
      });
      return;
    }

    existing.records = {
      consultations: mergeNormalizedEntries(existing.records?.consultations, caseItem.records?.consultations, 'CON'),
      prescriptions: mergeNormalizedEntries(existing.records?.prescriptions, caseItem.records?.prescriptions, 'PRE'),
      labResults: mergeNormalizedEntries(existing.records?.labResults, caseItem.records?.labResults, 'LAB'),
      immunizations: mergeNormalizedEntries(existing.records?.immunizations, caseItem.records?.immunizations, 'IMM'),
      referrals: mergeNormalizedEntries(existing.records?.referrals, caseItem.records?.referrals, 'REF'),
      sputum: mergeNormalizedEntries(existing.records?.sputum, caseItem.records?.sputum, 'SPT'),
      xray: mergeNormalizedEntries(existing.records?.xray, caseItem.records?.xray, 'XRAY'),
      adherence: mergeNormalizedEntries(existing.records?.adherence, caseItem.records?.adherence, 'ADH'),
      treatment: mergeNormalizedEntries(existing.records?.treatment, caseItem.records?.treatment, 'TRT'),
      followup: mergeNormalizedEntries(existing.records?.followup, caseItem.records?.followup, 'FUP'),
      ultrasound: mergeNormalizedEntries(existing.records?.ultrasound, caseItem.records?.ultrasound, 'US'),
      trimester: mergeNormalizedEntries(existing.records?.trimester, caseItem.records?.trimester, 'TM'),
      maternal: mergeNormalizedEntries(existing.records?.maternal, caseItem.records?.maternal, 'MAT'),
      bpMonitoring: mergeNormalizedEntries(existing.records?.bpMonitoring, caseItem.records?.bpMonitoring, 'BPM'),
      medication: mergeNormalizedEntries(existing.records?.medication, caseItem.records?.medication, 'MED'),
      glucose: mergeNormalizedEntries(existing.records?.glucose, caseItem.records?.glucose, 'GLU'),
      complications: mergeNormalizedEntries(existing.records?.complications, caseItem.records?.complications, 'CMP'),
      growth: mergeNormalizedEntries(existing.records?.growth, caseItem.records?.growth, 'GRW'),
      development: mergeNormalizedEntries(existing.records?.development, caseItem.records?.development, 'DEV'),
    };
    existing.isDefault = existing.isDefault || caseItem.isDefault;
  });
  normalizedCases = Array.from(dedupedCases.values());
  
  // Handle legacy top-level records by merging them into an OPD case
  const topLevelConsultations = record.consultations || [];
  const topLevelPrescriptions = record.prescriptions || [];
  const topLevelLabResults = record.labResults || [];
  const topLevelImmunizations = record.immunizations || [];
  const topLevelReferrals = record.referrals || [];

  if (topLevelConsultations.length > 0 || 
      topLevelPrescriptions.length > 0 || 
      topLevelLabResults.length > 0 || 
      topLevelImmunizations.length > 0 ||
      topLevelReferrals.length > 0) {
    
    let opdCase = normalizedCases.find(c => normalizeCaseId(c.id) === 'opd');
    
    if (!opdCase) {
      opdCase = {
        id: 'opd',
        label: 'OPD',
        name: 'General OPD',
        isDefault: true,
        records: {
          consultations: [],
          prescriptions: [],
          labResults: [],
          immunizations: [],
          referrals: [],
          sputum: [], xray: [], adherence: [], treatment: [], followup: [],
          ultrasound: [], trimester: [], maternal: [], bpMonitoring: [],
          medication: [], glucose: [], complications: [], growth: [], development: []
        }
      };
      normalizedCases.unshift(opdCase);
    }
    
    // Helper to merge records without duplicates
    const mergeRecords = (target, source, prefix) => {
      const existingIds = new Set(target.map(r => r.id || r._id));
      const result = [...target];
      source.forEach(r => {
        const id = r.id || r._id;
        if (!existingIds.has(id)) {
          result.push(r);
        }
      });
      return normalizeEntries(result, prefix);
    };

    if (!opdCase.records) opdCase.records = {};
    opdCase.records.consultations = mergeRecords(opdCase.records.consultations || [], topLevelConsultations, 'CON');
    opdCase.records.prescriptions = mergeRecords(opdCase.records.prescriptions || [], topLevelPrescriptions, 'PRE');
    opdCase.records.labResults = mergeRecords(opdCase.records.labResults || [], topLevelLabResults, 'LAB');
    opdCase.records.immunizations = mergeRecords(opdCase.records.immunizations || [], topLevelImmunizations, 'IMM');
    opdCase.records.referrals = mergeRecords(opdCase.records.referrals || [], topLevelReferrals, 'REF');
  }

  const normalizedCategory = (record.category || '').toString().trim().toLowerCase();
  const hasTbCase = normalizedCases.some((c) => normalizeCaseId(c.id) === 'tb');
  if ((normalizedCategory === 'tb dots' || normalizedCategory === 'tb') && hasTbCase) {
    normalizedCases = normalizedCases.filter((c) => {
      const caseId = normalizeCaseId(c.id);
      if (caseId !== 'opd') return true;
      return !isCaseEmpty(c);
    });
  }

  return {
    ...record,
    patientAvatar: record.patientAvatar || getInitials(record.patientName || record.patientId),
    cases: normalizedCases
  };
};

const mockMedicalRecords = [
  {
    patientId: "PT-000001",
    patientName: "Maria Santos",
    age: 45,
    sex: "Female",
    bloodType: "O+",
    address: "Purok 3, Barangay Central",
    contact: "09123456789",
    category: "OPD",
    knownConditions: "Hypertension",
    allergies: "Penicillin",
    lastVisit: "2024-03-15",
    cases: [
      {
        id: "opd",
        label: "OPD",
        name: "General OPD",
        isDefault: true,
        records: {
          consultations: [],
          prescriptions: [],
          labResults: [],
          immunizations: [],
          referrals: []
        }
      },
      {
        id: "hypertension",
        label: "Hypertension",
        name: "Hypertension Management",
        isDefault: false,
        records: {
          consultations: [
            {
              id: "CON-001",
              date: "2024-03-15",
              chiefComplaint: "Headache and dizziness",
              diagnosis: "Tension headache, mild hypertension",
              treatment: "Paracetamol 500mg, Ibuprofen 400mg",
              notes: "Monitor BP daily. Return if symptoms persist.",
              bloodPressure: "140/90",
              temperature: "36.5°C",
              weight: "65kg"
            },
            {
              id: "CON-002",
              date: "2024-02-10",
              chiefComplaint: "Follow-up checkup",
              diagnosis: "Hypertension controlled",
              treatment: "Continue medication",
              notes: "BP stable, continue current regimen",
              bloodPressure: "130/85",
              temperature: "36.8°C"
            }
          ],
          prescriptions: [
            { id: "PRE-001", medicine: "Amlodipine 5mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", datePrescribed: "2024-03-15" },
            { id: "PRE-002", medicine: "Paracetamol 500mg", dosage: "2 tablets", frequency: "Every 6 hours", duration: "5 days", datePrescribed: "2024-03-15" }
          ],
          labResults: [
            { id: "LAB-001", testName: "Complete Blood Count", result: "Normal", normalRange: "4.5-11.0", dateOfTest: "2024-03-15", remarks: "Normal" },
            { id: "LAB-002", testName: "Blood Glucose", result: "95 mg/dL", normalRange: "70-100", dateOfTest: "2024-03-15", remarks: "Normal" }
          ],
          immunizations: [
            { id: "IMM-001", vaccineName: "Influenza Vaccine", dateGiven: "2023-11-01", nextDueDate: "2024-11-01" }
          ],
          referrals: [],
          bpMonitoring: [
            { id: "BP-001", date: "2024-03-15", systolic: "140", diastolic: "90", remarks: "High" },
            { id: "BP-002", date: "2024-02-10", systolic: "130", diastolic: "85", remarks: "Normal" }
          ]
        }
      }
    ]
  },
  {
    patientId: "PT-000002",
    patientName: "Juan Cruz",
    age: 12,
    sex: "Male",
    bloodType: "B+",
    address: "Purok 1, Barangay Central",
    contact: "09123456790",
    category: "Pediatric",
    knownConditions: "Asthma",
    allergies: "Dust",
    lastVisit: "2024-03-12",
    cases: [
      {
        id: "opd",
        label: "OPD",
        name: "General OPD",
        isDefault: true,
        records: {
          consultations: [],
          prescriptions: [],
          labResults: [],
          immunizations: [],
          referrals: []
        }
      },
      {
        id: "asthma",
        label: "Asthma",
        name: "Asthma Management",
        isDefault: false,
        records: {
          consultations: [
            {
              id: "CON-003",
              date: "2024-03-12",
              chiefComplaint: "Cough and colds for 3 days",
              diagnosis: "Upper Respiratory Infection",
              treatment: "Amoxicillin 250mg, Paracetamol",
              notes: "Rest, plenty of fluids. Avoid dusty environment.",
              bloodPressure: "100/60",
              temperature: "37.8°C",
              weight: "35kg"
            }
          ],
          prescriptions: [
            { id: "PRE-003", medicine: "Amoxicillin 250mg", dosage: "5ml", frequency: "3x daily", duration: "7 days", datePrescribed: "2024-03-12" }
          ],
          labResults: [],
          immunizations: [
            { id: "IMM-003", vaccineName: "MMR", dateGiven: "2023-04-10", nextDueDate: null }
          ],
          referrals: []
        }
      }
    ]
  },
  {
    patientId: "PT-000003",
    patientName: "Rosa Hernandez",
    age: 28,
    sex: "Female",
    bloodType: "A+",
    address: "Purok 5, Barangay Central",
    contact: "09123456791",
    category: "Prenatal",
    knownConditions: "First Pregnancy",
    allergies: "None",
    lastVisit: "2024-03-10",
    cases: [
      {
        id: "prenatal",
        label: "Prenatal",
        name: "Prenatal Care",
        isDefault: true,
        records: {
          consultations: [
            {
              id: "CON-004",
              date: "2024-03-10",
              chiefComplaint: "Prenatal checkup - 6 months pregnant",
              diagnosis: "Normal pregnancy, healthy mother and baby",
              treatment: "Prenatal vitamins, Iron supplement",
              notes: "Continue prenatal care. Next visit in 4 weeks.",
              bloodPressure: "110/70",
              temperature: "36.5°C",
              weight: "58kg"
            }
          ],
          prescriptions: [
            { id: "PRE-004", medicine: "Prenatal Vitamins", dosage: "1 capsule", frequency: "Once daily", duration: "30 days", datePrescribed: "2024-03-10" },
            { id: "PRE-005", medicine: "Ferrous Sulfate", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", datePrescribed: "2024-03-10" }
          ],
          labResults: [
            { id: "LAB-003", testName: "Hemoglobin", result: "11.5 g/dL", normalRange: "12-16", dateOfTest: "2024-03-10", remarks: "Normal" }
          ],
          immunizations: [
            { id: "IMM-004", vaccineName: "Tetanus Toxoid", dateGiven: "2024-02-01", nextDueDate: "2024-08-01" }
          ],
          referrals: [],
          ultrasound: [
            { id: "US-001", date: "2024-01-15", findings: "Single live fetus, gestational age 20 weeks", remarks: "Normal" }
          ],
          trimester: [
            { id: "TM-001", trimester: "2nd", startDate: "2024-01-01", endDate: "2024-03-31", status: "Completed" },
            { id: "TM-002", trimester: "3rd", startDate: "2024-04-01", endDate: "2024-06-30", status: "Current" }
          ]
        }
      }
    ]
  },
  {
    patientId: "PT-000004",
    patientName: "Pedro Reyes",
    age: 72,
    sex: "Male",
    bloodType: "AB+",
    address: "Purok 2, Barangay Central",
    contact: "09123456792",
    category: "Senior",
    knownConditions: "Diabetes Type 2, Arthritis",
    allergies: "Sulfa drugs",
    lastVisit: "2024-03-08",
    cases: [
      {
        id: "opd",
        label: "OPD",
        name: "General OPD",
        isDefault: true,
        records: {
          consultations: [],
          prescriptions: [],
          labResults: [],
          immunizations: [],
          referrals: []
        }
      },
      {
        id: "diabetes",
        label: "Diabetes",
        name: "Diabetes Management",
        isDefault: false,
        records: {
          consultations: [
            {
              id: "CON-005",
              date: "2024-03-08",
              chiefComplaint: "Regular checkup for diabetes",
              diagnosis: "Diabetes controlled, arthritis stable",
              treatment: "Metformin 500mg, joint supplement",
              notes: "Continue medication. Monitor blood sugar levels.",
              bloodPressure: "135/80",
              temperature: "36.4°C",
              weight: "70kg"
            }
          ],
          prescriptions: [
            { id: "PRE-006", medicine: "Metformin 500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "90 days", datePrescribed: "2024-03-08" }
          ],
          labResults: [
            { id: "LAB-004", testName: "HbA1c", result: "6.5%", normalRange: "<5.7", dateOfTest: "2024-03-08", remarks: "Borderline" },
            { id: "LAB-005", testName: "Fasting Blood Sugar", result: "118 mg/dL", normalRange: "70-100", dateOfTest: "2024-03-08", remarks: "Abnormal" }
          ],
          immunizations: [
            { id: "IMM-005", vaccineName: "Pneumococcal Vaccine", dateGiven: "2023-06-15", nextDueDate: null },
            { id: "IMM-006", vaccineName: "Influenza Vaccine", dateGiven: "2023-11-01", nextDueDate: "2024-11-01" }
          ],
          referrals: [
            { id: "REF-001", referredTo: "Diabetologist", reason: "Diabetes management", date: "2024-03-08", status: "Pending" }
          ],
          glucose: [
            { id: "GLU-001", date: "2024-03-08", fasting: "118", random: "145", remarks: "Elevated" }
          ]
        }
      },
      {
        id: "hypertension",
        label: "Hypertension",
        name: "Hypertension Management",
        isDefault: false,
        records: {
          consultations: [],
          prescriptions: [
            { id: "PRE-007", medicine: "Amlodipine 10mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", datePrescribed: "2024-03-08" }
          ],
          labResults: [],
          immunizations: [],
          referrals: [],
          bpMonitoring: [
            { id: "BP-003", date: "2024-03-08", systolic: "135", diastolic: "80", remarks: "Slightly Elevated" }
          ]
        }
      }
    ]
  }
]

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null)
  const [showConsultationForm, setShowConsultationForm] = useState(false)
  const [showClinicalForm, setShowClinicalForm] = useState(false)
  const [clinicalFormType, setClinicalFormType] = useState(null)
  const [clinicalFormData, setClinicalFormData] = useState({})
  const [prefillData, setPrefillData] = useState(null)
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [censusResidents, setCensusResidents] = useState([])
  const [loadingResidents, setLoadingResidents] = useState(false)
  const [residentSearch, setResidentSearch] = useState("")
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
const [debouncedSearch, setDebouncedSearch] = useState("")
  const location = useLocation()
  const [newPatientFromRegistration, setNewPatientFromRegistration] = useState(null)
  const [registrationPatientData, setRegistrationPatientData] = useState(null)
  const [isInitializingRecord, setIsInitializingRecord] = useState(false)

  const caseCategoryMap = {
    'Prenatal': ['prenatal'],
    'TB DOTS': ['tb'],
    'Immunization': ['vaccination', 'immunization'],
    'Pediatric': ['pediatric', 'childcare'],
    'Dental': ['dental'],
    'Family Planning': ['familyplanning'],
    'Hypertension': ['hypertension', 'ncd'],
    'Diabetes': ['diabetes', 'ncd'],
    'NCD': ['ncd', 'hypertension', 'diabetes', 'asthma'],
    'Nutrition': ['nutrition'],
    'Emergency': ['emergency'],
    'Senior': ['senior'],
    'General': ['opd']
  }

  const fetchMedicalRecords = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(RECORDS_API)
      if (response.data && Array.isArray(response.data)) {
        setRecords(response.data.map(normalizeRecord))
      }
    } catch (error) {
      console.log("Error fetching records:", error)
      // Only use mock data if specifically needed or if API fails
      if (records.length === 0) {
        setRecords(mockMedicalRecords.map(normalizeRecord))
      }
    } finally {
      setLoading(false)
    }
  }, [records.length])

  useEffect(() => {
    fetchMedicalRecords()
  }, [fetchMedicalRecords])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (location.state && location.state.patientId) {
      const { patientId, patientData } = location.state;
      const registrationData = patientData || { patientId };
      setNewPatientFromRegistration(registrationData);
      setRegistrationPatientData(registrationData);
      setSelectedPatientId(patientId);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchSelectedPatientProfile = async () => {
      if (!selectedPatientId) {
        setSelectedPatientProfile(null)
        return
      }

      try {
        const response = await axios.get(`${API_BASE}/patients/profile/by-id`, {
          params: { patientId: selectedPatientId }
        })

        setSelectedPatientProfile(response.data?.patient || null)
      } catch (error) {
        console.log("Error fetching patient profile:", error)
        setSelectedPatientProfile(null)
      }
    }

    fetchSelectedPatientProfile()
  }, [selectedPatientId])

  useEffect(() => {
    const handleNewPatientRegistration = async () => {
      if (newPatientFromRegistration && !loading) {
        setIsInitializingRecord(true);
        try {
          const res = await axios.post(RECORDS_API + "/create-initial", {
            patientId: newPatientFromRegistration.patientId,
            patientName: newPatientFromRegistration.name || newPatientFromRegistration.patientName,
            age: newPatientFromRegistration.age,
            sex: newPatientFromRegistration.gender || newPatientFromRegistration.sex,
            category: newPatientFromRegistration.category,
            address: newPatientFromRegistration.address,
            contact: newPatientFromRegistration.contact,
            bloodType: newPatientFromRegistration.bloodType,
            emergencyContact: newPatientFromRegistration.emergencyContact,
            medicalHistory: newPatientFromRegistration.medicalHistory || [],
            lastVisit: newPatientFromRegistration.lastVisit || new Date().toISOString().split('T')[0]
          });

          if (res.data) {
            await fetchMedicalRecords();
          }
          setSelectedPatientId(newPatientFromRegistration.patientId);
        } catch (error) {
          console.error("Error creating initial medical record:", error);
        } finally {
          setIsInitializingRecord(false);
        }
        setNewPatientFromRegistration(null);
      }
    };
    handleNewPatientRegistration();
  }, [newPatientFromRegistration, records, fetchMedicalRecords, loading]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.patientName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.patientId?.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      let matchCategory = true
      if (categoryFilter !== "All") {
        if (categoryFilter === "General") {
          matchCategory = r.category === "OPD" || !r.cases || r.cases.length === 0
        } else if (categoryFilter === "Immunization") {
          matchCategory = (r.cases && r.cases.some(c => caseCategoryMap['Immunization'].includes(c.id)))
        } else if (caseCategoryMap[categoryFilter]) {
          const caseIds = caseCategoryMap[categoryFilter]
          matchCategory = r.category === categoryFilter || (r.cases && r.cases.some(c => caseIds.includes(c.id)))
        } else {
          matchCategory = r.category === categoryFilter
        }
      }
      
      const matchFrom = !dateFrom || (r.lastVisit && r.lastVisit >= dateFrom)
      const matchTo = !dateTo || (r.lastVisit && r.lastVisit <= dateTo)
      return matchSearch && matchCategory && matchFrom && matchTo
    })
  }, [records, debouncedSearch, categoryFilter, dateFrom, dateTo])

  const stats = useMemo(() => {
    const totalPatients = records.length
    const totalConsultations = records.reduce((sum, r) => sum + (r.consultations?.length || 0), 0)
    const totalPrescriptions = records.reduce((sum, r) => sum + (r.prescriptions?.length || 0), 0)
    const totalImmunizations = records.reduce((sum, r) => sum + (r.immunizations?.length || 0), 0)
    return { totalPatients, totalConsultations, totalPrescriptions, totalImmunizations }
  }, [records])

  const getPatientRecord = useCallback((patientId) => {
    return records.find(r => r.patientId === patientId || r._id === patientId)
  }, [records])

  const addPatient = useCallback((patient) => {
    const newPatient = {
      ...patient,
      patientId: patient.patientId || `PT-${String(Date.now()).slice(-6)}`,
      patientAvatar: patient.patientAvatar || getInitials(patient.patientName || patient.patientId),
      cases: patient.cases || [
        {
          id: 'opd',
          label: 'OPD',
          name: 'General OPD',
          isDefault: true,
          records: {
            consultations: [],
            prescriptions: [],
            labResults: [],
            immunizations: [],
            referrals: [],
            sputum: [],
            xray: [],
            adherence: [],
            treatment: [],
            followup: [],
            ultrasound: [],
            trimester: [],
            maternal: [],
            bpMonitoring: [],
            medication: [],
            glucose: [],
            complications: [],
            growth: [],
            development: []
          }
        }
      ],
      lastVisit: patient.lastVisit || new Date().toISOString().split('T')[0]
    }
    return axios.post(RECORDS_API + "/add", newPatient).then(async (response) => {
      await fetchMedicalRecords()
      return response.data.patientId || newPatient.patientId
    })
  }, [fetchMedicalRecords])

  const updatePatientRecord = useCallback((patientId, updates) => {
    setRecords(prev => prev.map(r => 
      r.patientId === patientId ? { ...r, ...updates } : r
    ))
  }, [])

  const addConsultationToRecord = useCallback(async (patientId, caseId, consultation) => {
    try {
      console.log("Saving consultation:", patientId, caseId, consultation)
      const payload = {
        ...consultation,
        time: consultation.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        caseType: caseId
      }
      const response = await axios.post(`${RECORDS_API}/${patientId}/consultations`, payload)
      console.log("Consultation saved:", response.data)
      await fetchMedicalRecords()
      return response.data
    } catch (error) {
      console.error('Error saving consultation:', error)
      alert("Could not save consultation. Make sure the backend server is running.")
      throw error
    }
  }, [fetchMedicalRecords])

  const addPrescriptionToRecord = useCallback(async (patientId, caseId, prescription) => {
    try {
      const payload = { ...prescription, caseType: caseId }
      await axios.post(`${RECORDS_API}/${patientId}/prescriptions`, payload)
      await fetchMedicalRecords()
    } catch (error) {
      console.error('Error saving prescription:', error)
      alert("Could not save prescription. Make sure the backend server is running.")
    }
  }, [fetchMedicalRecords])

  const addLabResultToRecord = useCallback(async (patientId, caseId, result) => {
    try {
      const payload = { ...result, caseType: caseId }
      await axios.post(`${RECORDS_API}/${patientId}/lab-results`, payload)
      await fetchMedicalRecords()
    } catch (error) {
      console.error('Error saving lab result:', error)
      alert("Could not save lab result. Make sure the backend server is running.")
    }
  }, [fetchMedicalRecords])

  const addImmunizationToRecord = useCallback(async (patientId, caseId, immunization) => {
    try {
      const payload = { ...immunization, caseType: caseId }
      await axios.post(`${RECORDS_API}/${patientId}/immunizations`, payload)
      await fetchMedicalRecords()
    } catch (error) {
      console.error('Error saving immunization:', error)
      alert("Could not save immunization. Make sure the backend server is running.")
    }
  }, [fetchMedicalRecords])

  const deleteConsultationFromRecord = useCallback(async (patientId, id) => {
    if (window.confirm("Are you sure you want to delete this consultation?")) {
      try {
        await axios.delete(`${RECORDS_API}/${patientId}/consultations/${id}`)
        await fetchMedicalRecords()
      } catch (error) {
        console.error('Error deleting consultation:', error)
        alert("Could not delete consultation.")
      }
    }
  }, [fetchMedicalRecords])

  const deletePrescriptionFromRecord = useCallback(async (patientId, id) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      try {
        await axios.delete(`${RECORDS_API}/${patientId}/prescriptions/${id}`)
        await fetchMedicalRecords()
      } catch (error) {
        console.error('Error deleting prescription:', error)
        alert("Could not delete prescription.")
      }
    }
  }, [fetchMedicalRecords])

  const deleteLabResultFromRecord = useCallback(async (patientId, id) => {
    if (window.confirm("Are you sure you want to delete this lab result?")) {
      try {
        await axios.delete(`${RECORDS_API}/${patientId}/lab-results/${id}`)
        await fetchMedicalRecords()
      } catch (error) {
        console.error('Error deleting lab result:', error)
        alert("Could not delete lab result.")
      }
    }
  }, [fetchMedicalRecords])

  const deleteImmunizationFromRecord = useCallback(async (patientId, id) => {
    if (window.confirm("Are you sure you want to delete this immunization record?")) {
      try {
        await axios.delete(`${RECORDS_API}/${patientId}/immunizations/${id}`)
        await fetchMedicalRecords()
      } catch (error) {
        console.error('Error deleting immunization:', error)
        alert("Could not delete immunization record.")
      }
    }
  }, [fetchMedicalRecords])

  const handleViewRecord = (patientId) => {
    setSelectedPatientId(patientId)
  }

  const handleBackToList = async (patientId = null, targetPatientId = null) => {
    setSelectedPatientId(null)
    fetchMedicalRecords()
  }

  const addCaseToRecord = useCallback(async (patientId, newCase) => {
    try {
      console.log("Adding case to patient:", patientId, newCase)
      const payload = { cases: newCase }
      const response = await axios.put(`${RECORDS_API}/${patientId}/cases`, payload)
      console.log("Case added successfully:", response.data)
      await fetchMedicalRecords()
    } catch (error) {
      console.error("Error adding case to record:", error)
      alert("Could not save case. Make sure the backend server is running.")
    }
  }, [fetchMedicalRecords])

  const deleteCaseFromRecord = useCallback(async (patientId, caseId) => {
    try {
      console.log("Deleting case from patient:", patientId, caseId)
      const response = await axios.delete(`${RECORDS_API}/${patientId}/cases/${caseId}`)
      console.log("Case deleted successfully:", response.data)
      await fetchMedicalRecords()
    } catch (error) {
      console.error("Error deleting case from record:", error)
      alert("Could not delete case. Make sure the backend server is running.")
    }
  }, [fetchMedicalRecords])

  const openConsultationForm = (patientId, prefill = null) => {
    setSelectedPatientId(patientId)
    setPrefillData(prefill)
    setShowConsultationForm(true)
  }

  const openClinicalForm = (caseType, patientId) => {
    console.log("Opening clinical form for:", caseType, patientId);
    setClinicalFormType(caseType)
    setShowClinicalForm(true)
  }

  // Prefill clinical form data when modal opens
  useEffect(() => {
    if (!showClinicalForm || !selectedPatientId) return
    const record = getPatientRecord(selectedPatientId)
    const patient = selectedPatientProfile || {}
    if (clinicalFormType === 'pediatric' || clinicalFormType === 'child care') {
      const pd = (record && record.pediatricData) || patient.pediatricData || {}
      setClinicalFormData({
        babyFullName: pd.babyFullName || '',
        timeOfBirth: pd.timeOfBirth || '',
        placeOfBirth: pd.placeOfBirth || '',
        birthWeight: pd.birthWeight || '',
        birthLength: pd.birthLength || '',
        deliveryType: pd.deliveryType || '',
        birthStatus: pd.birthStatus || '',
        guardianName: pd.guardianName || '',
        guardianRelation: pd.guardianRelation || '',
        guardianPhone: pd.guardianPhone || '',
        assignedHealthWorker: pd.assignedHealthWorker || '',
        remarks: pd.remarks || '',
        bcgGiven: pd.bcgGiven || false,
        hepaBGiven: pd.hepaBGiven || false,
        bcgDate: pd.bcgDate || '',
        hepaBDate: pd.hepaBDate || '',
        firstCheckupDate: pd.firstCheckupDate || '',
        immunizationStatus: pd.immunizationStatus || ''
      })
    } else {
      setClinicalFormData({})
    }
  }, [showClinicalForm, clinicalFormType, selectedPatientId, selectedPatientProfile])

  const saveClinicalProfile = async () => {
    if (!selectedPatientId) return alert('No patient selected')
    try {
      if (clinicalFormType === 'pediatric' || clinicalFormType === 'child care') {
        const resp = await axios.put(`${RECORDS_API}/${selectedPatientId}`, { pediatricData: clinicalFormData })
        console.log('Saved pediatricData response:', resp.data)
      }
      // Refresh and close
      await fetchMedicalRecords()
      // Ensure selected record is refreshed
      try {
        const single = await axios.get(`${RECORDS_API}/${selectedPatientId}`)
        console.log('Fetched single record after save:', single.data)
      } catch (err) {
        console.warn('Could not fetch single record after save:', err)
      }
      setSelectedPatientId(selectedPatientId)
      setShowClinicalForm(false)
    } catch (err) {
      console.error('Error saving clinical profile:', err)
      alert('Could not save clinical profile. Make sure the backend is running.')
    }
  }

  const handleConsultationSaved = () => {
    setShowConsultationForm(false)
    setPrefillData(null)
    fetchMedicalRecords()
  }

  const handlePatientAdded = (patientId) => {
    setShowPatientSelector(false)
    setSelectedPatientId(patientId)
  }

  const openPatientSelector = async () => {
    setShowPatientSelector(true)
    setLoadingResidents(true)
    try {
      const response = await axios.get(RESIDENTS_API)
      setCensusResidents(response.data)
    } catch (error) {
      console.error("Error fetching residents:", error)
    }
    setLoadingResidents(false)
  }

  const handleSelectResident = async (resident) => {
    const residentRecordId = resident.residentId || resident._id
    const existingRecord = records.find(r => r.patientId === residentRecordId || r.patientId === resident._id)
    if (existingRecord) {
      setSelectedPatientId(existingRecord.patientId)
      setShowPatientSelector(false)
      return
    }
    
    const newPatientId = await addPatient({
      patientId: residentRecordId,
      patientName: formatResidentName(resident),
      patientAvatar: getInitials(formatResidentName(resident)),
      age: resident.age,
      sex: resident.gender,
      bloodType: '',
      address: `${resident.purok ? 'Purok ' + resident.purok + ', ' : ''}${resident.address || ''}`.trim(),
      contact: resident.contactNumber || '',
      category: 'OPD',
      knownConditions: '',
      allergies: ''
    })
    
    setSelectedPatientId(newPatientId)
    setShowPatientSelector(false)
  }

  const filteredResidents = censusResidents.filter(r => {
    const fullName = `${r.firstName} ${r.middleName || ''} ${r.lastName}`.toLowerCase()
    return fullName.includes(residentSearch.toLowerCase())
  })

  if (isInitializingRecord) {
    return (
      <Layout title="Medical Records" subtitle="Initializing patient record...">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <FontAwesomeIcon icon={faSync} spin size="3x" style={{ color: '#4169E1', marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#1E293B', fontWeight: 800 }}>Preparing Medical Record...</h3>
          <p style={{ color: '#64748B' }}>Initializing the case-based history for the patient.</p>
        </div>
      </Layout>
    )
  }

  if (selectedPatientId) {
    const record = getPatientRecord(selectedPatientId)
    
    if (!record && loading) {
       return (
        <Layout title="Medical Records" subtitle="Loading record...">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <FontAwesomeIcon icon={faSync} spin size="3x" style={{ color: '#4169E1', marginBottom: '1.5rem' }} />
          </div>
        </Layout>
      )
    }

    return (
      <Layout title="Medical Records" subtitle="Patient Record Details">
        <PatientRecordProfile 
          key={selectedPatientId + (record?.updatedAt || '')}
          patientId={selectedPatientId} 
          record={record}
          patientProfile={selectedPatientProfile}
          registrationProfile={registrationPatientData}
          initialTab={location.state?.autoOpen ? 'overview' : undefined}
          onBack={handleBackToList}
          onBackToPatientList={handleBackToList}
          onAddConsultation={openConsultationForm}
          onAddConsultationSave={addConsultationToRecord}
          onAddPrescription={addPrescriptionToRecord}
          onAddLabResult={addLabResultToRecord}
          onAddImmunization={addImmunizationToRecord}
          onDeleteConsultation={deleteConsultationFromRecord}
          onDeletePrescription={deletePrescriptionFromRecord}
          onDeleteLabResult={deleteLabResultFromRecord}
          onDeleteImmunization={deleteImmunizationFromRecord}
          onAddCase={addCaseToRecord}
          onDeleteCase={deleteCaseFromRecord}
          onAddCaseData={openClinicalForm}
          showConsultationForm={showConsultationForm}
          prefillData={prefillData}
          onConsultationSaved={handleConsultationSaved}
        />
      </Layout>
    )
  }

  const categories = ['All', 'General', 'Prenatal', 'Immunization', 'Pediatric', 'Dental', 'Family Planning', 'Senior', 'NCD', 'TB DOTS', 'Nutrition', 'Emergency']

  const categoryColors = {
    All: { bg: '#F1F5F9', text: '#64748B', icon: faUsers },
    General: { bg: '#DBEAFE', text: '#1D4ED8', icon: faFileMedical },
    Prenatal: { bg: '#FCE7F3', text: '#DB2777', icon: faUserInjured },
    Immunization: { bg: '#EDE9FE', text: '#7C3AED', icon: faSyringe },
    Pediatric: { bg: '#D1FAE5', text: '#059669', icon: faUsers },
    Dental: { bg: '#FEF3C7', text: '#D97706', icon: faUserInjured },
    'Family Planning': { bg: '#CFFAFE', text: '#0891B2', icon: faUsers },
    Senior: { bg: '#ECFCCB', text: '#65A30D', icon: faUserInjured },
    NCD: { bg: '#FEE2E2', text: '#DC2626', icon: faHeartbeat },
    'TB DOTS': { bg: '#E0E7FF', text: '#4F46E5', icon: faUserInjured },
    Nutrition: { bg: '#CCFBF1', text: '#0D9488', icon: faUserInjured },
    Emergency: { bg: '#FEE2E2', text: '#DC2626', icon: faUserInjured }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Layout 
      title="Medical Records" 
      subtitle="Comprehensive health records management"
    >
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <style>{`
        .stat-card-mr { background: white; padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid #E2E8F0; transition: all 0.2s; }
        .stat-card-mr:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .search-input-mr { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border-radius: 10px; border: 1.5px solid #E2E8F0; outline: none; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
        .search-input-mr:focus { border-color: #4169E1; box-shadow: 0 0 0 3px rgba(65,105,225,0.1); }
        .filter-select-mr { padding: 0.625rem 1rem; border-radius: 10px; border: 1.5px solid #E2E8F0; outline: none; font-weight: 600; font-size: 0.85rem; background: white; cursor: pointer; transition: all 0.2s; }
        .filter-select-mr:focus { border-color: #4169E1; }
        .patient-card-mr { background: white; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; cursor: pointer; transition: all 0.3s ease; }
        .patient-card-mr:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); border-color: #4169E1; }
      `}</style>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card-mr">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Total Patients</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4169E1' }}>{stats.totalPatients}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #4169E1, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: 'white', fontSize: '1.25rem' }} />
            </div>
          </div>
        </div>
        <div className="stat-card-mr">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Consultations</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981' }}>{stats.totalConsultations}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faStethoscope} style={{ color: 'white', fontSize: '1.25rem' }} />
            </div>
          </div>
        </div>
        <div className="stat-card-mr">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Prescriptions</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8B5CF6' }}>{stats.totalPrescriptions}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faPills} style={{ color: 'white', fontSize: '1.25rem' }} />
            </div>
          </div>
        </div>
        <div className="stat-card-mr">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Immunizations</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F59E0B' }}>{stats.totalImmunizations}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faSyringe} style={{ color: 'white', fontSize: '1.25rem' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '1rem', 
        flexWrap: 'wrap',
        background: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '200px' }}>
          <FontAwesomeIcon 
            icon={faSearch} 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', zIndex: 1 }} 
          />
          <input
            type="text"
            placeholder="Search patient name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-mr"
          />
        </div>

        <button
          onClick={fetchMedicalRecords}
          disabled={loading}
          style={{
            background: 'white',
            border: '1.5px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.625rem 1rem',
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <FontAwesomeIcon icon={faSync} style={{ fontSize: '0.85rem', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginRight: '4px' }}>Filter:</span>
        {categories.map((cat, index) => {
          const style = categoryColors[cat] || { bg: '#F1F5F9', text: '#64748B' }
          const isActive = categoryFilter === cat || (cat === 'All' && categoryFilter === 'All')
          const iconMap = {
            'All': faUsers,
            'General': faFileMedical,
            'Prenatal': faUserInjured,
            'Immunization': faSyringe,
            'Pediatric': faUsers,
            'Dental': faUserInjured,
            'Family Planning': faUsers,
            'Senior': faUserInjured,
            'NCD': faHeartbeat,
            'TB DOTS': faUserInjured,
            'Nutrition': faUserInjured,
            'Emergency': faUserInjured
          }
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '25px',
                border: isActive ? 'none' : '1.5px solid',
                background: isActive 
                  ? `linear-gradient(135deg, ${style.text}, ${style.text}CC)` 
                  : style.bg,
                color: isActive ? 'white' : style.text,
                borderColor: isActive ? 'transparent' : `${style.text}50`,
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 4px 12px ${style.text}40` : 'none',
                fontFamily: 'inherit'
              }}
            >
              <FontAwesomeIcon icon={iconMap[cat]} style={{ fontSize: '0.7rem' }} />
              {cat}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          background: 'white', 
          borderRadius: '24px',
          border: '2px dashed #E2E8F0'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FontAwesomeIcon icon={faSync} size="2x" style={{ color: '#4169E1', animation: 'spin 1s linear infinite' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>
            Loading medical records...
          </h3>
          <p style={{ margin: 0, color: '#94A3B8', fontWeight: 500 }}>
            Please wait while we fetch the data
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          background: 'white', 
          borderRadius: '24px',
          border: '2px dashed #E2E8F0'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FontAwesomeIcon icon={faUserInjured} size="2x" style={{ color: '#CBD5E1' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>
            No patient records found
          </h3>
          <p style={{ margin: 0, color: '#94A3B8', fontWeight: 500 }}>
            {records.length > 0 
              ? `Found ${records.length} total records, but none match your current search/filter.`
              : (searchQuery || categoryFilter !== "All" ? "Try adjusting your search or filters" : "No medical records available yet")}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {filteredRecords.map(record => {
            const categoryStyle = categoryColors[record.category] || { bg: '#F1F5F9', text: '#64748B' }
            const initials = record.patientAvatar || record.patientName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            
            return (
              <div 
                key={record.patientId}
                className="patient-card-mr"
                onClick={() => handleViewRecord(record.patientId)}
              >
                <div style={{ height: '8px', background: `linear-gradient(90deg, ${categoryStyle.text}, ${categoryStyle.text}80)` }}></div>
                
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '1rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${categoryStyle.bg}, ${categoryStyle.text}40)`,
                      color: categoryStyle.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      boxShadow: `0 4px 12px ${categoryStyle.text}20`
                    }}>
                      {initials}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {record.patientName}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#4169E1', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        {record.patientId}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        marginLeft: '8px',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        background: categoryStyle.bg,
                        color: categoryStyle.text,
                        textTransform: 'uppercase'
                      }}>
                        {record.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '8px',
                    padding: '12px',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: '0.9rem', color: '#10B981', marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>{record.consultations?.length || 0}</div>
                      <div style={{ fontSize: '0.55rem', color: '#94A3B8' }}>Consult</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faPills} style={{ fontSize: '0.9rem', color: '#8B5CF6', marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>{record.prescriptions?.length || 0}</div>
                      <div style={{ fontSize: '0.55rem', color: '#94A3B8' }}>Rx</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faVial} style={{ fontSize: '0.9rem', color: '#F59E0B', marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>{record.labResults?.length || 0}</div>
                      <div style={{ fontSize: '0.55rem', color: '#94A3B8' }}>Lab</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '0.9rem', color: '#EF4444', marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>{record.immunizations?.length || 0}</div>
                      <div style={{ fontSize: '0.55rem', color: '#94A3B8' }}>Immune</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '8px 12px', background: '#FEFCE8', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.75rem', color: '#D97706' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706' }}>Last Visit</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>{formatDate(record.lastVisit)}</span>
                  </div>

                  {record.cases && record.cases.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {record.cases.map(caseItem => (
                          <span key={caseItem.id} style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: '#E0E7FF',
                            color: '#4F46E5'
                          }}>
                            {caseItem.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewRecord(record.patientId) }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, #4169E1, #1E40AF)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(65,105,225,0.3)'
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Record
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); { handleViewRecord(record.patientId) } }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      marginTop: '8px'
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add New Cases
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredRecords.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '2rem',
          padding: '1rem'
        }}>
          <div style={{ background: 'white', padding: '12px 24px', borderRadius: '30px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>
              Showing <span style={{ color: '#4169E1', fontWeight: 800 }}>{filteredRecords.length}</span> patient{filteredRecords.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {showPatientSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4169E1, #1E40AF)',
              padding: '1.5rem 2rem',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FontAwesomeIcon icon={faUserInjured} style={{ color: 'white', fontSize: '1.25rem' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Select Patient</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Choose from census residents</p>
                </div>
              </div>
              <button
                onClick={() => setShowPatientSelector(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ color: 'white' }} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <FontAwesomeIcon 
                  icon={faSearch} 
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} 
                />
                <input
                  type="text"
                  placeholder="Search residents..."
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                    borderRadius: '12px',
                    border: '2px solid #E2E8F0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {loadingResidents ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Loading...</div>
              ) : filteredResidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No residents found. Register residents in Census first.
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredResidents.map(resident => {
                    const fullName = `${resident.firstName} ${resident.middleName || ''} ${resident.lastName} ${resident.suffix || ''}`.trim()
                    const existingRecord = records.find(r => r.patientId === resident._id)
                    
                    return (
                      <button
                        key={resident._id}
                        onClick={() => handleSelectResident(resident)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          background: existingRecord ? '#F0FDF4' : 'white',
                          border: `2px solid ${existingRecord ? '#10B981' : '#E2E8F0'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: existingRecord ? '#10B981' : '#4169E1',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}>
                          {resident.firstName?.[0]}{resident.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {resident.age} yrs, {resident.gender} {resident.purok ? `• Purok ${resident.purok}` : ''}
                          </div>
                        </div>
                        {existingRecord && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', background: '#D1FAE5', padding: '4px 8px', borderRadius: '4px' }}>
                            Has Record
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* CLINICAL PROFILE FORM MODAL */}
      {showClinicalForm && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, padding: '1rem' }}>
          <div className="report-card animate-scale-in" style={{ width: '100%', maxWidth: '850px', padding: '2rem', borderRadius: '28px', background: 'white', maxHeight: '92vh', overflowY: 'auto' }}>
             <h2 style={{ margin: '0 0 1rem', color: '#1E293B' }}>Clinical Profile: {clinicalFormType}</h2>
             <p style={{ color: '#64748B', marginBottom: '2rem' }}>Please fill in the required clinical data for this new case.</p>
             {/* Add form fields for the clinical profile based on clinicalFormType */}
             {clinicalFormType === 'pediatric' || clinicalFormType === 'child care' ? (
               <div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Baby's Full Name</label>
                     <input value={clinicalFormData.babyFullName || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, babyFullName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Time of Birth</label>
                     <input value={clinicalFormData.timeOfBirth || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, timeOfBirth: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Place of Birth</label>
                     <input value={clinicalFormData.placeOfBirth || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, placeOfBirth: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Birth Weight</label>
                     <input value={clinicalFormData.birthWeight || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, birthWeight: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Birth Length</label>
                     <input value={clinicalFormData.birthLength || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, birthLength: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Delivery Type</label>
                     <input value={clinicalFormData.deliveryType || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, deliveryType: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Birth Status</label>
                     <input value={clinicalFormData.birthStatus || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, birthStatus: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Guardian Name</label>
                     <input value={clinicalFormData.guardianName || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, guardianName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Guardian Relation</label>
                     <input value={clinicalFormData.guardianRelation || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, guardianRelation: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>Guardian Phone</label>
                     <input value={clinicalFormData.guardianPhone || ''} onChange={e => setClinicalFormData({ ...clinicalFormData, guardianPhone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                   </div>
                 </div>

                 <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                   <button onClick={() => setShowClinicalForm(false)} style={{ padding: '10px 20px', background: '#E5E7EB', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                   <button onClick={saveClinicalProfile} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                 </div>
               </div>
             ) : (
               <div>
                 <p>No clinical form implemented for this case type yet.</p>
                 <button onClick={() => setShowClinicalForm(false)} style={{ padding: '10px 20px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
               </div>
             )}
          </div>
        </div>
      )}

    </Layout>
  )
}
