import React, { useState, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowLeft, 
  faArrowRight,
  faStethoscope, 
  faPills, 
  faVial,
  faSyringe,
  faPlus,
  faTrash,
  faThermometer,
  faWeight,
  faHeartPulse,
  faUserInjured,
  faCalendarAlt,
  faLocationArrow,
  faClipboardList,
  faFlask,
  faNotesMedical,
  faUserCheck,
  faChevronRight,
  faFileCirclePlus,
  faUsers,
  faLungs,
  faBaby,
  faTeeth,
  faLungsVirus,
  faHeart,
  faSyringe as faSyringeAlt,
  faClipboardCheck,
  faFileMedicalAlt,
  faXRay,
  
  faBabyCarriage,
  faTeethOpen,
  faStomach,
  faEye,
  faBrain,
  faBone,
  faHandHoldingMedical,
  faHospital,
  faAmbulance,
  faSuitcaseMedical,
  faMicroscope,
  faVirus,
  faHeadSideVirus,
  faCalendarCheck,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown
} from "@fortawesome/free-solid-svg-icons"
import ConsultationForm from "./ConsultationForm"
import PrescriptionForm from "./PrescriptionForm"
import LabResultForm from "./LabResultForm"
import ImmunizationForm from "./ImmunizationForm"
import NewCaseForm from "./NewCaseForm"
import CaseTypeSelector from "./CaseTypeSelector"

const categoryColors = {
  OPD: { bg: '#DBEAFE', text: '#1D4ED8', gradient: 'linear-gradient(135deg, #4169E1, #1E40AF)', accent: '#3B82F6' },
  'TB DOTS': { bg: '#E0E7FF', text: '#4F46E5', gradient: 'linear-gradient(135deg, #4F46E5, #3730A3)', accent: '#4F46E5' },
  Pediatric: { bg: '#D1FAE5', text: '#059669', gradient: 'linear-gradient(135deg, #10B981, #059669)', accent: '#10B981' },
  Immunization: { bg: '#EDE9FE', text: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)', accent: '#7C3AED' },
  Prenatal: { bg: '#FCE7F3', text: '#DB2777', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)', accent: '#DB2777' },
  NCD: { bg: '#FEE2E2', text: '#DC2626', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', accent: '#EF4444' },
  Dental: { bg: '#FEF3C7', text: '#D97706', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', accent: '#F59E0B' },
  'Family Planning': { bg: '#CFFAFE', text: '#0891B2', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)', accent: '#0891B2' },
  Senior: { bg: '#ECFCCB', text: '#65A30D', gradient: 'linear-gradient(135deg, #84CC16, #65A30D)', accent: '#65A30D' },
  Emergency: { bg: '#FEE2E2', text: '#DC2626', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', accent: '#EF4444' }
}

export const CASE_TYPES = {
  opd: { 
    id: 'opd', 
    label: 'OPD', 
    name: 'General OPD',
    icon: faStethoscope, 
    color: '#4169E1', 
    bg: '#EEF2FF',
    defaultCase: true 
  },
  prenatal: { 
    id: 'prenatal', 
    label: 'Prenatal', 
    name: 'Prenatal Care',
    icon: faBabyCarriage, 
    color: '#DB2777', 
    bg: '#FCE7F3' 
  },
  tb: { 
    id: 'tb', 
    label: 'TB DOTS', 
    name: 'TB DOTS Program',
    icon: faLungs, 
    color: '#4F46E5', 
    bg: '#E0E7FF' 
  },
  pediatric: { 
    id: 'pediatric', 
    label: 'Pediatric', 
    name: 'Child Care Services',
    icon: faBaby, 
    color: '#059669', 
    bg: '#D1FAE5' 
  },
  immunization: { 
    id: 'immunization', 
    label: 'Immunization', 
    name: 'Vaccination Programs',
    icon: faSyringeAlt, 
    color: '#7C3AED', 
    bg: '#EDE9FE' 
  },
  
  dental: { 
    id: 'dental', 
    label: 'Dental', 
    name: 'Dental Care',
    icon: faTeeth, 
    color: '#D97706', 
    bg: '#FEF3C7' 
  },
  familyplanning: { 
    id: 'familyplanning', 
    label: 'Family Planning', 
    name: 'Family Planning Services',
    icon: faUsers, 
    color: '#0891B2', 
    bg: '#CFFAFE' 
  },
  senior: { 
    id: 'senior', 
    label: 'Senior', 
    name: 'Senior Care Services',
    icon: faUserInjured, 
    color: '#65A30D', 
    bg: '#ECFCCB' 
  }
}

export const CASE_SPECIFIC_TABS = {
  tb: [
    { id: 'consultations', label: 'Consultations', icon: faStethoscope, default: true },
    { id: 'sputum', label: 'Sputum Results', icon: faMicroscope },
    { id: 'xray', label: 'X-Ray Reports', icon: faXRay },
    { id: 'adherence', label: 'Medication Adherence', icon: faCheckCircle },
    { id: 'treatment', label: 'Treatment Plan', icon: faClipboardCheck },
    { id: 'followup', label: 'Follow-up Schedule', icon: faCalendarCheck },
    { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
    { id: 'labResults', label: 'Lab Results', icon: faVial },
  ],
  prenatal: [
    { id: 'overview', label: 'Overview', icon: faClipboardList, default: true },
    { id: 'consultations', label: 'Prenatal Checkups', icon: faBabyCarriage, default: true },
    { id: 'ultrasound', label: 'Ultrasound', icon: faEye },
    { id: 'trimester', label: 'Trimester Monitoring', icon: faCalendarCheck },
    { id: 'maternal', label: 'Maternal Care (Vitals)', icon: faHeartPulse },
    { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt },
    { id: 'prenatalSchedule', label: 'Prenatal Schedule', icon: faCalendarAlt },
    { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
    { id: 'labResults', label: 'Lab Results', icon: faVial },
  ],
  pediatric: [
    { id: 'consultations', label: 'Checkups', icon: faStethoscope, default: true },
    { id: 'babyInfo', label: 'Baby Info', icon: faBaby },
    { id: 'growth', label: 'Growth Monitoring', icon: faArrowUp },
    { id: 'development', label: 'Development', icon: faBaby },
    { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt },
    { id: 'labResults', label: 'Lab Results', icon: faVial },
    { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
  ],
  
  default: [
    { id: 'consultations', label: 'Consultations', icon: faStethoscope, default: true },
    { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
    { id: 'labResults', label: 'Lab Results', icon: faVial },
    { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt },
    { id: 'referrals', label: 'Referrals', icon: faHospital },
  ]
}

const getTabsForCase = (caseId) => {
  const baseTabs = CASE_SPECIFIC_TABS[caseId] || CASE_SPECIFIC_TABS.default
  // Ensure an 'overview' tab exists for all case types so the registration overview
  // (medical history, emergency contact, allergies, medications) is always accessible.
  const hasOverview = baseTabs.some(t => t.id === 'overview')
  if (!hasOverview) {
    return [{ id: 'overview', label: 'Overview', icon: faClipboardList, default: false }, ...baseTabs]
  }
  return baseTabs
}

export default function PatientRecordProfile({ 
  patientId, 
  record,
  patientProfile,
  registrationProfile,
  onBack, 
  onAddConsultation, 
  showConsultationForm, 
  prefillData, 
  onConsultationSaved,
  onAddConsultationSave,
  onAddPrescription,
  onAddLabResult,
  onAddImmunization,
  onDeleteConsultation,
  onDeletePrescription,
  onDeleteLabResult,
  onDeleteImmunization,
  onBackToPatientList,
  onAddCase,
  onDeleteCase,
  onAddCaseData
  , initialTab
}) {
  const [activeTab, setActiveTab] = useState('consultations')
  const [showForms, setShowForms] = useState({ consultation: false, prescription: false, labResult: false, immunization: false })
  const [showCaseSelector, setShowCaseSelector] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [caseList, setCaseList] = useState([])

  React.useEffect(() => {
    if (record?.cases && Array.isArray(record.cases)) {
      setCaseList(record.cases)
      if (!selectedCaseId && record.cases.length > 0) {
        const defaultCase = record.cases.find(c => c.isDefault) || record.cases[0]
        setSelectedCaseId(defaultCase?.id || null)
      }
    } else {
      const defaultCaseId = 'opd'
      const existingCases = [
        { id: defaultCaseId, label: CASE_TYPES.opd.label, name: CASE_TYPES.opd.name, isDefault: true, records: {} }
      ]
      setCaseList(existingCases)
      setSelectedCaseId(defaultCaseId)
    }
  }, [record])

  const selectedCase = useMemo(() => {
    return caseList.find(c => c.id === selectedCaseId) || caseList[0]
  }, [caseList, selectedCaseId])

  const selectedCaseType = selectedCase ? CASE_TYPES[selectedCase.id] || CASE_TYPES.opd : CASE_TYPES.opd
  const registrationMedicalHistory = Array.isArray(registrationProfile?.medicalHistory) && registrationProfile.medicalHistory.length > 0
    ? registrationProfile.medicalHistory
    : null
  const patientMedicalHistory = Array.isArray(patientProfile?.medicalHistory) && patientProfile.medicalHistory.length > 0
    ? patientProfile.medicalHistory
    : null
  const recordMedicalHistory = Array.isArray(record?.medicalHistory) && record.medicalHistory.length > 0
    ? record.medicalHistory
    : null
  const registrationEmergencyContact = registrationProfile?.emergencyContact?.name || registrationProfile?.emergencyContact?.relation || registrationProfile?.emergencyContact?.phone
    ? registrationProfile.emergencyContact
    : null
  const patientEmergencyContact = patientProfile?.emergencyContact?.name || patientProfile?.emergencyContact?.relation || patientProfile?.emergencyContact?.phone
    ? patientProfile.emergencyContact
    : null
  const recordEmergencyContact = record?.emergencyContact?.name || record?.emergencyContact?.relation || record?.emergencyContact?.phone
    ? record.emergencyContact
    : null
  const overviewSource = {
    ...(record || {}),
    ...(patientProfile || {}),
    ...(registrationProfile || {}),
    medicalHistory: registrationMedicalHistory || patientMedicalHistory || recordMedicalHistory || [],
    emergencyContact: registrationEmergencyContact || patientEmergencyContact || recordEmergencyContact || {},
    allergies: registrationProfile?.allergies || patientProfile?.allergies || record?.allergies || [],
    medications: registrationProfile?.medications || patientProfile?.medications || record?.medications || []
  }

  const currentTabs = useMemo(() => {
    return getTabsForCase(selectedCaseId)
  }, [selectedCaseId])

  React.useEffect(() => {
    const tabs = getTabsForCase(selectedCaseId)
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs.find(t => t.default)?.id || tabs[0]?.id || 'consultations')
    }
    // If caller requested an initial tab (e.g., autoOpen), set it after tabs load
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [selectedCaseId])

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId)
    const tabs = getTabsForCase(caseId)
    setActiveTab(tabs.find(t => t.default)?.id || tabs[0]?.id || 'consultations')
    setShowForms({ consultation: false, prescription: false, labResult: false, immunization: false })
  }

  const handleAddNewCase = (newCaseType) => {
    const caseType = CASE_TYPES[newCaseType]
    if (!caseType) return

    const existingCase = caseList.find(c => c.id === newCaseType)

    const newCase = {
      ...(existingCase || {}),
      id: newCaseType,
      label: caseType.label,
      name: caseType.name,
      status: 'Active',
      isDefault: false,
      records: existingCase?.records || {
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

    // Newly added/activated case always goes to the front
    const updatedCases = [newCase, ...caseList.filter(c => c.id !== newCaseType).map(c => ({ ...c, status: 'Previous' }))]
    setCaseList(updatedCases)
    setSelectedCaseId(newCaseType)
    setShowCaseSelector(false)

    if (onAddCase) {
      onAddCase(patientId, newCase)
    }

    // Trigger clinical profile form if it's a new case
    console.log("Triggering clinical profile for:", newCaseType);
    if (onAddCaseData) {
      console.log("Calling onAddCaseData handler...");
      onAddCaseData(newCaseType, patientId)
    }
  }

  const handleDeleteCase = (caseId) => {
    if (caseId === 'opd') return

    const caseToDelete = caseList.find(c => c.id === caseId)
    if (!caseToDelete || caseToDelete.isDefault) return

    const updatedCases = caseList.filter(c => c.id !== caseId)
    setCaseList(updatedCases)
    
    if (selectedCaseId === caseId) {
      setSelectedCaseId(updatedCases[0]?.id || 'opd')
    }

    if (onDeleteCase) {
      onDeleteCase(patientId, caseId)
    }
  }

  const getRecordForTab = (tabId) => {
    if (!selectedCase?.records) return []
    return selectedCase.records[tabId] || []
  }

  const getRecordCounts = () => {
    if (!selectedCase?.records) return { consultations: 0, prescriptions: 0, labResults: 0, immunizations: 0 }
    const records = selectedCase.records
    const total = Object.values(records).reduce((sum, value) => {
      return sum + (Array.isArray(value) ? value.length : 0)
    }, 0)
    return {
      consultations: records.consultations?.length || 0,
      prescriptions: records.prescriptions?.length || 0,
      labResults: records.labResults?.length || 0,
      immunizations: records.immunizations?.length || 0,
      total
    }
  }

  const getTabCount = (tabId) => {
    if (tabId === 'overview') {
      const hasMedicalHistory = (overviewSource?.medicalHistory?.length || 0) > 0
      const hasEmergencyContact = !!(overviewSource?.emergencyContact?.name || overviewSource?.emergencyContact?.relation || overviewSource?.emergencyContact?.phone)
      return hasMedicalHistory || hasEmergencyContact ? 1 : 0
    }
    if (tabId === 'babyInfo') {
      const pd = overviewSource?.pediatricData || record?.pediatricData
      const hasBabyData = pd && (pd.babyFullName || pd.placeOfBirth || pd.birthWeight || pd.guardianName)
      return hasBabyData ? 1 : 0
    }
    if (tabId === 'prenatalSchedule') {
      return prenatalScheduledDate ? 1 : 0
    }
    const records = getRecordForTab(tabId)
    return records?.length || 0
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  if (!record) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#F8FAFC', minHeight: '100vh' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <FontAwesomeIcon icon={faUserInjured} size="2x" style={{ color: '#EF4444' }} />
        </div>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>Patient record not found</h2>
        <p style={{ margin: '0 0 1.5rem', color: '#64748B' }}>The patient record you're looking for doesn't exist.</p>
        <button onClick={onBack} style={{ padding: '12px 24px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
      </div>
    )
  }

  const categoryStyle = categoryColors[record.category] || { bg: '#F1F5F9', text: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #475569)', accent: '#64748B' }
  const counts = getRecordCounts()
  const prenatalScheduledDate = selectedCase?.records?.followup?.[0]?.date || record?.prenatalData?.nextVisitDate

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        .tab-btn-mr { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: none; background: transparent; color: #64748B; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .tab-btn-mr:hover { background: #F1F5F9; transform: translateY(-1px); }
        .tab-btn-mr.active { background: ${selectedCaseType.color}; color: white; box-shadow: 0 4px 12px ${selectedCaseType.color}40; }
        .data-card-mr { background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 1.5rem; transition: all 0.3s; position: relative; overflow: hidden; }
        .data-card-mr:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .data-card-mr::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
        .add-btn-mr { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; border: none; background: ${selectedCaseType.color}; color: white; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px ${selectedCaseType.color}40; }
        .add-btn-mr:hover { transform: translateY(-2px); box-shadow: 0 6px 16px ${selectedCaseType.color}50; }
        .empty-state-mr { text-align: center; padding: 4rem 2rem; }
        .empty-icon-mr { width: 72px; height: 72px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
        .stat-mini-card { background: white; border-radius: 12px; border: 1px solid #E2E8F0; padding: 1rem; text-align: center; transition: all 0.2s; }
        .stat-mini-card:hover { border-color: #CBD5E1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .case-pill { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; border: none; }
        .case-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .case-pill.active { color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .case-pill-remove { background: rgba(255,255,255,0.3); border: none; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: inherit; font-size: 0.7rem; margin-left: 2px; }
        .case-pill-remove:hover { background: rgba(255,255,255,0.5); }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Top Row: Back Button and Add New Cases Button */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #E2E8F0', padding: '10px 18px', borderRadius: '10px', color: '#64748B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>

          <button
            onClick={() => setShowCaseSelector(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
              transition: 'all 0.3s'
            }}
          >
            <FontAwesomeIcon icon={faFileCirclePlus} />
            Switch/Add Case
          </button>
        </div>

        {/* Case Type Selector Modal */}
        <CaseTypeSelector 
          isOpen={showCaseSelector}
          onClose={() => setShowCaseSelector(false)}
          onSelect={handleAddNewCase}
          existingCases={caseList.filter(c => c.status === 'Active').map(c => c.id)}
        />

        {/* Patient Header Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{ height: '6px', background: categoryStyle.gradient }}></div>
          
          <div style={{ padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: categoryStyle.gradient,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 900,
                boxShadow: `0 8px 24px ${categoryStyle.text}30`,
                flexShrink: 0
              }}>
                {record.patientAvatar}
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                    {record.patientName}
                  </h1>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: categoryStyle.bg,
                    color: categoryStyle.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {record.category}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#4169E1', background: '#EEF2FF', padding: '4px 10px', borderRadius: '6px' }}>
                    {record.patientId}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
                    <FontAwesomeIcon icon={faUserInjured} style={{ fontSize: '0.75rem', color: categoryStyle.accent }} /> {record.age} yrs, {record.sex}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
                    <FontAwesomeIcon icon={faHeartPulse} style={{ fontSize: '0.75rem', color: '#EF4444' }} /> {record.bloodType || 'N/A'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faLocationArrow} style={{ fontSize: '0.75rem' }} /> {record.address || 'No address'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.75rem' }} /> {record.contact || 'No contact'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {record.knownConditions && record.knownConditions !== 'None' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FontAwesomeIcon icon={faNotesMedical} style={{ fontSize: '0.65rem' }} /> {record.knownConditions}
                  </span>
                )}
                {record.allergies && record.allergies !== 'None known' && record.allergies !== 'None' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: '0.65rem' }} /> {
                      Array.isArray(record.allergies)
                        ? record.allergies
                            .map(a => (typeof a === 'object' ? (a.allergen || a.name || a.reaction || '') : a))
                            .filter(Boolean)
                            .join(', ')
                        : record.allergies
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Case Breadcrumb */}
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '16px 20px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: selectedCase ? '12px' : '0' }}>
            <button 
              onClick={onBack}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'transparent', 
                border: 'none', 
                padding: '0',
                fontWeight: 600, 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '0.75rem' }} />
              {record.patientName}
            </button>
            
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.65rem', color: '#CBD5E1' }} />
            
            {caseList.map((caseItem, index) => {
              const caseType = CASE_TYPES[caseItem.id] || CASE_TYPES.opd
              const isActive = selectedCaseId === caseItem.id
              const canDelete = !caseItem.isDefault && !isActive
              
              return (
                <React.Fragment key={caseItem.id}>
                  <button
                    onClick={() => handleSelectCase(caseItem.id)}
                    className={`case-pill ${isActive ? 'active' : ''}`}
                    style={{
                      background: isActive ? caseType.color : caseType.bg,
                      color: isActive ? 'white' : caseType.color,
                    }}
                  >
                    <FontAwesomeIcon icon={caseType.icon} style={{ fontSize: '0.75rem' }} />
                    {caseItem.label || caseType.label}
                    {canDelete && (
                      <button 
                        className="case-pill-remove"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCase(caseItem.id) }}
                      >
                        x
                      </button>
                    )}
                  </button>
                  
                  {index < caseList.length - 1 && (
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.65rem', color: '#CBD5E1' }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          
          {selectedCase && (
            <div style={{ 
              padding: '12px 16px', 
              background: selectedCaseType.bg,
              borderRadius: '10px',
              border: `1px solid ${selectedCaseType.color}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: selectedCaseType.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FontAwesomeIcon icon={selectedCaseType.icon} style={{ fontSize: '1rem' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedCaseType.color }}>
                      {selectedCase.name || selectedCaseType.name}
                    </div>
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 900, 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      background: selectedCase.status === 'Active' ? '#10B981' : '#94A3B8', 
                      color: 'white',
                      textTransform: 'uppercase'
                    }}>
                      {selectedCase.status || (selectedCase.isDefault ? 'Active' : 'Previous')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: selectedCaseType.color, opacity: 0.8 }}>
                    Case ID: {selectedCase.id.toUpperCase()} | Records: {counts.total} total
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div className="stat-mini-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faStethoscope} style={{ color: selectedCaseType.color, fontSize: '0.85rem' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: selectedCaseType.color }}>{counts.consultations}</div>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consultations</div>
          </div>
          <div className="stat-mini-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faPills} style={{ color: '#8B5CF6', fontSize: '0.85rem' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B5CF6' }}>{counts.prescriptions}</div>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prescriptions</div>
          </div>
          <div className="stat-mini-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faVial} style={{ color: '#10B981', fontSize: '0.85rem' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{counts.labResults}</div>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lab Results</div>
          </div>
          <div className="stat-mini-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faSyringeAlt} style={{ color: '#F59E0B', fontSize: '0.85rem' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F59E0B' }}>{counts.immunizations}</div>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Immunizations</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '6px', 
            marginBottom: '1.5rem', 
            background: 'white', 
            padding: '10px 12px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflowX: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn-mr ${activeTab === tab.id ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ fontSize: '0.85rem' }} />
              {tab.label}
              <span style={{
                padding: '2px 8px',
                borderRadius: '999px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : selectedCaseType.bg,
                color: activeTab === tab.id ? 'white' : selectedCaseType.color,
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {getTabCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Registration Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faClipboardList} style={{ color: '#DB2777', fontSize: '1rem' }} />
                </span>
                Registration Overview
              </h3>

              {/* ── PERSONAL INFORMATION ── */}
              <div className="data-card-mr" style={{ borderLeft: `4px solid ${selectedCaseType.color}`, marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: selectedCaseType.color, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                  Personal Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Full Name', value: overviewSource?.name || record?.patientName },
                    { label: 'Age', value: overviewSource?.age || record?.age },
                    { label: 'Sex / Gender', value: overviewSource?.gender || record?.sex },
                    { label: 'Civil Status', value: overviewSource?.civilStatus },
                    { label: 'Birthdate', value: overviewSource?.birthdate ? formatDate(overviewSource.birthdate) : record?.birthdate ? formatDate(record.birthdate) : null },
                    { label: 'Blood Type', value: overviewSource?.bloodType || record?.bloodType },
                    { label: 'Contact No.', value: overviewSource?.contact || record?.contact },
                    { label: 'Address', value: overviewSource?.address || record?.address },
                    { label: 'Barangay', value: overviewSource?.barangay || record?.barangay },
                    { label: 'Purok', value: overviewSource?.purok || record?.purok },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── VITAL SIGNS ── */}
              <div className="data-card-mr" style={{ borderLeft: '4px solid #10B981', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                  Vital Signs at Registration
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Blood Pressure', value: overviewSource?.bp || record?.bp },
                    { label: 'Blood Sugar', value: overviewSource?.bloodSugar || record?.bloodSugar },
                    { label: 'Weight', value: overviewSource?.weight || record?.weight },
                    { label: 'Height', value: overviewSource?.height || record?.height },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', borderRadius: '10px', border: '1px solid #6EE7B7' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.62rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#065F46' }}>{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── EMERGENCY CONTACT ── */}
              <div className="data-card-mr" style={{ borderLeft: '4px solid #F59E0B', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                  Emergency Contact
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Name', value: overviewSource?.emergencyContact?.name },
                    { label: 'Relation', value: overviewSource?.emergencyContact?.relation },
                    { label: 'Phone', value: overviewSource?.emergencyContact?.phone },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.62rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#92400E' }}>{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MEDICAL HISTORY ── */}
              <div className="data-card-mr" style={{ borderLeft: '4px solid #3B82F6', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                  Medical History ({overviewSource?.medicalHistory?.length || 0} recorded)
                </div>
                {/* Allergies (from registration/patient/record) */}
                {((Array.isArray(overviewSource?.allergies) && overviewSource.allergies.length > 0) || (typeof overviewSource?.allergies === 'string' && overviewSource.allergies.trim())) && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: '6px' }}>Allergies</div>
                    <div style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#7F1D1D' }}>
                      {Array.isArray(overviewSource.allergies)
                        ? overviewSource.allergies.map(a => (typeof a === 'object' ? (a.allergen || a.name || a.reaction || '') : a)).filter(Boolean).join(', ')
                        : overviewSource.allergies}
                    </div>
                  </div>
                )}

                {/* Medications (from registration/patient/record) */}
                {((Array.isArray(overviewSource?.medications) && overviewSource.medications.length > 0) || (typeof overviewSource?.medications === 'string' && overviewSource.medications.trim())) && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0C4A6E', textTransform: 'uppercase', marginBottom: '6px' }}>Medications</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                      {Array.isArray(overviewSource.medications)
                        ? overviewSource.medications.map((m, i) => (
                          <div key={m._id || m.id || i} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <div style={{ fontWeight: 800, color: '#0C4A6E' }}>{typeof m === 'object' ? (m.name || m.drug || 'Unnamed') : m}</div>
                            <div style={{ fontSize: '0.82rem', color: '#475569' }}>{typeof m === 'object' ? [m.dosage, m.frequency].filter(Boolean).join(' • ') : ''}</div>
                            {typeof m === 'object' && m.startDate && <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Start: {formatDate(m.startDate)}</div>}
                          </div>
                        ))
                        : (
                          <div style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>{overviewSource.medications}</div>
                        )}
                    </div>
                  </div>
                )}
                {overviewSource?.medicalHistory?.length ? overviewSource.medicalHistory.map((item, index) => (
                  <div key={item._id || item.id || index} style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{item.condition || 'Unnamed condition'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {item.diagnosedDate ? `Diagnosed: ${formatDate(item.diagnosedDate)}` : 'Diagnosed date not set'}
                      {item.status ? ` • Status: ${item.status}` : ''}
                    </div>
                    {item.notes && <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>{item.notes}</div>}
                  </div>
                )) : (
                  <div style={{ padding: '12px 14px', borderRadius: '12px', border: '1px dashed #CBD5E1', background: '#F8FAFC', color: '#94A3B8', fontSize: '0.9rem' }}>
                    No medical history recorded during registration.
                  </div>
                )}
              </div>

              {/* ── CATEGORY-SPECIFIC REGISTRATION DATA ── */}
              {/* Prenatal - show only when Prenatal case is selected */}
              {selectedCaseId === 'prenatal' && (record?.prenatalData?.trimester || overviewSource?.prenatalData?.trimester) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #EC4899', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EC4899', textTransform: 'uppercase', marginBottom: '1rem' }}>Prenatal Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Trimester', value: (record?.prenatalData || overviewSource?.prenatalData)?.trimester },
                      { label: 'Gestational Week', value: (record?.prenatalData || overviewSource?.prenatalData)?.gestationalWeek },
                      { label: 'Due Date', value: (record?.prenatalData || overviewSource?.prenatalData)?.dueDate ? formatDate((record?.prenatalData || overviewSource?.prenatalData)?.dueDate) : null },
                      { label: 'Risk Level', value: (record?.prenatalData || overviewSource?.prenatalData)?.riskLevel },
                      { label: 'Next Visit', value: (record?.prenatalData || overviewSource?.prenatalData)?.nextVisitDate ? formatDate((record?.prenatalData || overviewSource?.prenatalData)?.nextVisitDate) : null },
                      { label: 'Visit Time', value: (record?.prenatalData || overviewSource?.prenatalData)?.nextVisitTime },
                      { label: 'Visit Location', value: (record?.prenatalData || overviewSource?.prenatalData)?.nextVisitLocation },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#FDF2F8', borderRadius: '10px', border: '1px solid #F9A8D4' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#BE185D', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#9D174D' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pediatric */}
              {(record?.pediatricData?.babyFullName || overviewSource?.pediatricData?.babyFullName) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #8B5CF6', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: '1rem' }}>Pediatric Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: "Baby's Full Name", value: (record?.pediatricData || overviewSource?.pediatricData)?.babyFullName },
                      { label: 'Time of Birth', value: (record?.pediatricData || overviewSource?.pediatricData)?.timeOfBirth },
                      { label: 'Place of Birth', value: (record?.pediatricData || overviewSource?.pediatricData)?.placeOfBirth },
                      { label: 'Birth Weight', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthWeight },
                      { label: 'Birth Length', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthLength },
                      { label: 'Delivery Type', value: (record?.pediatricData || overviewSource?.pediatricData)?.deliveryType },
                      { label: 'Birth Status', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthStatus },
                      { label: 'Vitamin K Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.vitaminKGiven },
                      { label: 'Eye Ointment', value: (record?.pediatricData || overviewSource?.pediatricData)?.eyeOintmentGiven },
                      { label: 'Breastfeeding Started', value: (record?.pediatricData || overviewSource?.pediatricData)?.breastfeedingStarted },
                      { label: 'Newborn Screening', value: (record?.pediatricData || overviewSource?.pediatricData)?.newbornScreeningDone },
                      { label: 'BCG Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.bcgGiven },
                      { label: 'Hepa B Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.hepaBGiven },
                      { label: 'Guardian Name', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianName },
                      { label: 'Guardian Relation', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianRelation },
                      { label: 'Guardian Phone', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianPhone },
                      { label: 'Assigned Health Worker', value: (record?.pediatricData || overviewSource?.pediatricData)?.assignedHealthWorker },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#4C1D95' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  {(record?.pediatricData || overviewSource?.pediatricData)?.remarks && (
                    <div style={{ marginTop: '0.75rem', padding: '10px 12px', background: '#EDE9FE', borderRadius: '10px' }}>
                      <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Remarks</p>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#4C1D95' }}>{(record?.pediatricData || overviewSource?.pediatricData)?.remarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TB DOTS overview removed as requested */}

              {/* Senior */}
              {(record?.seniorData?.mobilityStatus || overviewSource?.seniorData?.mobilityStatus || record?.seniorData?.philhealth || overviewSource?.seniorData?.philhealth) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #0EA5E9', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase', marginBottom: '1rem' }}>Senior Care Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'PhilHealth No.', value: (record?.seniorData || overviewSource?.seniorData)?.philhealth },
                      { label: 'Senior Citizen ID', value: (record?.seniorData || overviewSource?.seniorData)?.seniorCitizenId },
                      { label: 'Pension', value: (record?.seniorData || overviewSource?.seniorData)?.pension },
                      { label: 'OSCA ID', value: (record?.seniorData || overviewSource?.seniorData)?.oscaId },
                      { label: 'Mobility Status', value: (record?.seniorData || overviewSource?.seniorData)?.mobilityStatus },
                      { label: 'Cognitive Assessment', value: (record?.seniorData || overviewSource?.seniorData)?.cognitiveAssessment },
                      { label: 'Vision', value: (record?.seniorData || overviewSource?.seniorData)?.visionAssessment },
                      { label: 'Hearing', value: (record?.seniorData || overviewSource?.seniorData)?.hearingAssessment },
                      { label: 'Fall Risk', value: (record?.seniorData || overviewSource?.seniorData)?.fallRisk },
                      { label: 'Nutrition', value: (record?.seniorData || overviewSource?.seniorData)?.nutritionAssessment },
                      { label: 'Caregiver Info', value: (record?.seniorData || overviewSource?.seniorData)?.caregiverInfo },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#F0F9FF', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#0C4A6E' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NCD */}
              {(record?.ncdData?.hypertensionStage || overviewSource?.ncdData?.hypertensionStage) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #F97316', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F97316', textTransform: 'uppercase', marginBottom: '1rem' }}>NCD Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Hypertension Stage', value: (record?.ncdData || overviewSource?.ncdData)?.hypertensionStage },
                      { label: 'Diabetes Type', value: (record?.ncdData || overviewSource?.ncdData)?.diabetesType },
                      { label: 'Last HbA1c', value: (record?.ncdData || overviewSource?.ncdData)?.lastHbA1c },
                      { label: 'Last Fasting Glucose', value: (record?.ncdData || overviewSource?.ncdData)?.lastFastingGlucose },
                      { label: 'Last LDL', value: (record?.ncdData || overviewSource?.ncdData)?.lastLDL },
                      { label: 'Medication', value: (record?.ncdData || overviewSource?.ncdData)?.medication },
                      { label: 'Complications', value: (record?.ncdData || overviewSource?.ncdData)?.complications },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#7C2D12' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Family Planning */}
              {(record?.familyPlanningData?.methodChosen || overviewSource?.familyPlanningData?.methodChosen) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #A855F7', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#A855F7', textTransform: 'uppercase', marginBottom: '1rem' }}>Family Planning Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Method Chosen', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.methodChosen },
                      { label: 'Previous Method', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.previousMethod },
                      { label: 'Blood Pressure', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.bp },
                      { label: 'Weight', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.weight },
                      { label: 'Pregnancy History', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.pregnancyHistory },
                      { label: 'Next Resupply Date', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.nextResupplyDate ? formatDate((record?.familyPlanningData || overviewSource?.familyPlanningData)?.nextResupplyDate) : null },
                      { label: 'Follow-Up Date', value: (record?.familyPlanningData || overviewSource?.familyPlanningData)?.followUpDate ? formatDate((record?.familyPlanningData || overviewSource?.familyPlanningData)?.followUpDate) : null },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#FAF5FF', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#9333EA', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#581C87' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Immunization */}
              {(record?.immunizationData?.vaccineType || overviewSource?.immunizationData?.vaccineType) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #14B8A6', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#14B8A6', textTransform: 'uppercase', marginBottom: '1rem' }}>Immunization Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Vaccine Type', value: (record?.immunizationData || overviewSource?.immunizationData)?.vaccineType },
                      { label: 'Dose Number', value: (record?.immunizationData || overviewSource?.immunizationData)?.doseNumber },
                      { label: 'Date Administered', value: (record?.immunizationData || overviewSource?.immunizationData)?.dateAdministered ? formatDate((record?.immunizationData || overviewSource?.immunizationData)?.dateAdministered) : null },
                      { label: 'Vaccinator', value: (record?.immunizationData || overviewSource?.immunizationData)?.vaccinator },
                      { label: 'Injection Site', value: (record?.immunizationData || overviewSource?.immunizationData)?.injectionSite },
                      { label: 'Batch/Lot No.', value: (record?.immunizationData || overviewSource?.immunizationData)?.batchLotNumber },
                      { label: 'Next Dose Schedule', value: (record?.immunizationData || overviewSource?.immunizationData)?.nextDoseSchedule ? formatDate((record?.immunizationData || overviewSource?.immunizationData)?.nextDoseSchedule) : null },
                      { label: 'Status', value: (record?.immunizationData || overviewSource?.immunizationData)?.immunizationStatus },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#F0FDFA', borderRadius: '10px', border: '1px solid #99F6E4' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#0D9488', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#134E4A' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dental */}
              {(record?.dentalData?.chiefComplaint || overviewSource?.dentalData?.chiefComplaint) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #06B6D4', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase', marginBottom: '1rem' }}>Dental Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Chief Complaint', value: (record?.dentalData || overviewSource?.dentalData)?.chiefComplaint },
                      { label: 'Oral Examination', value: (record?.dentalData || overviewSource?.dentalData)?.oralExamination },
                      { label: 'Affected Tooth', value: (record?.dentalData || overviewSource?.dentalData)?.affectedTooth },
                      { label: 'Oral Hygiene Advice', value: (record?.dentalData || overviewSource?.dentalData)?.oralHygieneAdvice },
                      { label: 'Next Visit', value: (record?.dentalData || overviewSource?.dentalData)?.nextVisit ? formatDate((record?.dentalData || overviewSource?.dentalData)?.nextVisit) : null },
                      { label: 'Dentist Notes', value: (record?.dentalData || overviewSource?.dentalData)?.dentistNotes },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#ECFEFF', borderRadius: '10px', border: '1px solid #A5F3FC' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#0891B2', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#164E63' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Asthma */}
              {(record?.asthmaData?.severity || overviewSource?.asthmaData?.severity) && (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #64748B', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '1rem' }}>Asthma Registration Data</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Severity', value: (record?.asthmaData || overviewSource?.asthmaData)?.severity },
                      { label: 'Peak Flow', value: (record?.asthmaData || overviewSource?.asthmaData)?.peakFlow },
                      { label: 'Oxygen Saturation', value: (record?.asthmaData || overviewSource?.asthmaData)?.oxygenSat },
                      { label: 'Nebulization', value: (record?.asthmaData || overviewSource?.asthmaData)?.nebulization },
                      { label: 'Emergency Episodes', value: (record?.asthmaData || overviewSource?.asthmaData)?.emergencyEpisodes },
                      { label: 'Smoking Exposure', value: (record?.asthmaData || overviewSource?.asthmaData)?.smokingExposure },
                      { label: 'Breathing Assessment', value: (record?.asthmaData || overviewSource?.asthmaData)?.breathingAssessment },
                      { label: 'Allergy History', value: (record?.asthmaData || overviewSource?.asthmaData)?.allergyHistory },
                      { label: 'Follow-Up Date', value: (record?.asthmaData || overviewSource?.asthmaData)?.followUpDate ? formatDate((record?.asthmaData || overviewSource?.asthmaData)?.followUpDate) : null },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1E293B' }}>{value ?? 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Baby Info Tab (Pediatric) */}
          {activeTab === 'babyInfo' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faBaby} style={{ color: '#8B5CF6', fontSize: '1rem' }} />
                  </span>
                  Baby Info
                </h3>
              </div>

              {(record?.pediatricData || overviewSource?.pediatricData) ? (
                <div className="data-card-mr" style={{ borderLeft: '4px solid #8B5CF6', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: '1rem' }}>Pediatric / Baby Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: "Baby's Full Name", value: (record?.pediatricData || overviewSource?.pediatricData)?.babyFullName },
                      { label: 'Time of Birth', value: (record?.pediatricData || overviewSource?.pediatricData)?.timeOfBirth },
                      { label: 'Place of Birth', value: (record?.pediatricData || overviewSource?.pediatricData)?.placeOfBirth },
                      { label: 'Birth Weight', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthWeight },
                      { label: 'Birth Length', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthLength },
                      { label: 'Delivery Type', value: (record?.pediatricData || overviewSource?.pediatricData)?.deliveryType },
                      { label: 'Birth Status', value: (record?.pediatricData || overviewSource?.pediatricData)?.birthStatus },
                      { label: 'Vitamin K Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.vitaminKGiven },
                      { label: 'Eye Ointment', value: (record?.pediatricData || overviewSource?.pediatricData)?.eyeOintmentGiven },
                      { label: 'Breastfeeding Started', value: (record?.pediatricData || overviewSource?.pediatricData)?.breastfeedingStarted },
                      { label: 'Newborn Screening', value: (record?.pediatricData || overviewSource?.pediatricData)?.newbornScreeningDone },
                      { label: 'BCG Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.bcgGiven },
                      { label: 'Hepa B Given', value: (record?.pediatricData || overviewSource?.pediatricData)?.hepaBGiven },
                      { label: 'Guardian Name', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianName },
                      { label: 'Guardian Relation', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianRelation },
                      { label: 'Guardian Phone', value: (record?.pediatricData || overviewSource?.pediatricData)?.guardianPhone },
                      { label: 'Assigned Health Worker', value: (record?.pediatricData || overviewSource?.pediatricData)?.assignedHealthWorker },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#4C1D95' }}>{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  {(record?.pediatricData || overviewSource?.pediatricData)?.remarks && (
                    <div style={{ marginTop: '0.75rem', padding: '10px 12px', background: '#EDE9FE', borderRadius: '10px' }}>
                      <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Remarks</p>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#4C1D95' }}>{(record?.pediatricData || overviewSource?.pediatricData)?.remarks}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faBaby} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>No baby info recorded for this patient</h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Add pediatric/child-care information when creating the case to see it here.</p>
                </div>
              )}
            </div>
          )}

            {/* Prenatal Overview Tab */}
          {activeTab === 'consultations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faClipboardList} style={{ color: selectedCaseType.color, fontSize: '1rem' }} />
                  </span>
                  <span>{selectedCaseType.label} Consultations</span>
                </h3>
                <button onClick={() => setShowForms({ ...showForms, consultation: true })} className="add-btn-mr">
                  <FontAwesomeIcon icon={faPlus} /> New Consultation
                </button>
              </div>

              {showForms.consultation && (
                <ConsultationForm 
                  patientId={patientId} 
                  caseType={selectedCaseId}
                  onClose={() => setShowForms({ ...showForms, consultation: false })}
                  onSuccess={() => setShowForms({ ...showForms, consultation: false })}
                  onSave={async (data) => {
                    const dataWithCase = { ...data, caseType: selectedCaseId }
                    if (onAddConsultationSave) {
                      await onAddConsultationSave(patientId, selectedCaseId, dataWithCase)
                    }
                    if (onConsultationSaved) {
                      onConsultationSaved()
                    }
                  }}
                  prefillData={prefillData}
                />
              )}

              {getRecordForTab('consultations').length === 0 ? (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faClipboardList} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>
                    No records available for this case
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    Add a new {selectedCaseType.label.toLowerCase()} consultation to get started.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {getRecordForTab('consultations').map((consultation, index) => (
                    <div key={consultation.id} className="data-card-mr" style={{ borderLeft: `4px solid ${selectedCaseType.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: selectedCaseType.color }}>#{index + 1}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedCaseType.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.8rem' }} />
                              {formatDate(consultation.date)}
                            </span>
                            {consultation.time && (
                              <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                                {consultation.time}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => onDeleteConsultation && onDeleteConsultation(patientId, consultation.id)} 
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', borderRadius: '12px', border: '1px solid #FECACA' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Chief Complaint</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#7F1D1D' }}>{consultation.chiefComplaint}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Diagnosis</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF' }}>{consultation.diagnosis}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', borderRadius: '12px', border: '1px solid #6EE7B7' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Treatment</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#047857' }}>{consultation.treatment}</p>
                        </div>
                      </div>
                      
                      {consultation.notes && (
                        <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Clinical Notes</p>
                          <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{consultation.notes}</p>
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                        {consultation.bloodPressure && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FEF2F2', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faHeartPulse} style={{ color: '#EF4444', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#7F1D1D' }}>{consultation.bloodPressure}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>BP</span>
                          </div>
                        )}
                        {consultation.temperature && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FEF3C7', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faThermometer} style={{ color: '#D97706', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#92400E' }}>{consultation.temperature}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Temp</span>
                          </div>
                        )}
                        {consultation.weight && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#DBEAFE', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faWeight} style={{ color: '#2563EB', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#1E40AF' }}>{consultation.weight}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Weight</span>
                          </div>
                        )}
                        {consultation.pulseRate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#F0F9FF', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faHeart} style={{ color: '#0EA5E9', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#0369A1' }}>{consultation.pulseRate}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Pulse</span>
                          </div>
                        )}
                        {consultation.gestationalAge && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#F5F3FF', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faBaby} style={{ color: '#8B5CF6', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#5B21B6' }}>{consultation.gestationalAge} wks</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Age</span>
                          </div>
                        )}
                        {consultation.trimester && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFF7ED', borderRadius: '8px' }}>
                            <FontAwesomeIcon icon={faCalendarCheck} style={{ color: '#F97316', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 700, color: '#9A3412' }}>{consultation.trimester}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faPills} style={{ color: '#8B5CF6', fontSize: '1rem' }} />
                  </span>
                  <span>Prescription Records</span>
                </h3>
                <button onClick={() => setShowForms({ ...showForms, prescription: true })} className="add-btn-mr">
                  <FontAwesomeIcon icon={faPlus} /> Add Prescription
                </button>
              </div>

              {showForms.prescription && (
                <PrescriptionForm 
                  patientId={patientId}
                  caseType={selectedCaseId}
                  onClose={() => setShowForms({ ...showForms, prescription: false })}
                  onSuccess={() => setShowForms({ ...showForms, prescription: false })}
                  onSave={async (data) => {
                    const dataWithCase = { ...data, caseType: selectedCaseId }
                    if (onAddPrescription) {
                      await onAddPrescription(patientId, selectedCaseId, dataWithCase)
                    }
                  }}
                />
              )}

              {getRecordForTab('prescriptions').length === 0 ? (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faPills} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>
                    No records available for this case
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    Add a prescription for this {selectedCaseType.label.toLowerCase()} case.
                  </p>
                </div>
              ) : (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Medicine</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Dosage</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Frequency</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Duration</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ textAlign: 'center', padding: '14px 16px', width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecordForTab('prescriptions').map(rx => (
                        <tr key={rx.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1E293B' }}>{rx.medicine}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{rx.dosage}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{rx.frequency}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{rx.duration}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{formatDate(rx.datePrescribed)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button 
                              onClick={() => onDeletePrescription && onDeletePrescription(patientId, rx.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lab Results Tab */}
          {activeTab === 'labResults' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faVial} style={{ color: '#10B981', fontSize: '1rem' }} />
                  </span>
                  <span>Laboratory Results</span>
                </h3>
                <button onClick={() => setShowForms({ ...showForms, labResult: true })} className="add-btn-mr">
                  <FontAwesomeIcon icon={faPlus} /> Add Result
                </button>
              </div>

              {showForms.labResult && (
                <LabResultForm 
                  patientId={patientId}
                  caseType={selectedCaseId}
                  onClose={() => setShowForms({ ...showForms, labResult: false })}
                  onSuccess={() => setShowForms({ ...showForms, labResult: false })}
                  onSave={async (data) => {
                    const dataWithCase = { ...data, caseType: selectedCaseId }
                    if (onAddLabResult) {
                      await onAddLabResult(patientId, selectedCaseId, dataWithCase)
                    }
                  }}
                />
              )}

              {getRecordForTab('labResults').length === 0 ? (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faVial} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>
                    No records available for this case
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    Add laboratory results for this {selectedCaseType.label.toLowerCase()} case.
                  </p>
                </div>
              ) : (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Test Name</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Result</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Normal Range</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Remarks</th>
                        <th style={{ textAlign: 'center', padding: '14px 16px', width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecordForTab('labResults').map(lab => (
                        <tr key={lab.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1E293B' }}>{lab.testName}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>{lab.result}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.85rem' }}>{lab.normalRange || 'N/A'}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{formatDate(lab.dateOfTest)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: lab.remarks === 'Normal' ? '#D1FAE5' : lab.remarks === 'Abnormal' ? '#FEE2E2' : '#FEF3C7',
                              color: lab.remarks === 'Normal' ? '#059669' : lab.remarks === 'Abnormal' ? '#DC2626' : '#D97706'
                            }}>
                              {lab.remarks}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button 
                              onClick={() => onDeleteLabResult && onDeleteLabResult(patientId, lab.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Immunizations Tab */}
          {activeTab === 'immunizations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSyringeAlt} style={{ color: '#F59E0B', fontSize: '1rem' }} />
                  </span>
                  <span>Immunization Records</span>
                </h3>
                <button onClick={() => setShowForms({ ...showForms, immunization: true })} className="add-btn-mr">
                  <FontAwesomeIcon icon={faPlus} /> Add Immunization
                </button>
              </div>

              {showForms.immunization && (
                <ImmunizationForm 
                  patientId={patientId}
                  caseType={selectedCaseId}
                  onClose={() => setShowForms({ ...showForms, immunization: false })}
                  onSuccess={() => setShowForms({ ...showForms, immunization: false })}
                  onSave={async (data) => {
                    const dataWithCase = { ...data, caseType: selectedCaseId }
                    if (onAddImmunization) {
                      await onAddImmunization(patientId, selectedCaseId, dataWithCase)
                    }
                  }}
                />
              )}

              {getRecordForTab('immunizations').length === 0 ? (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faSyringeAlt} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>
                    No records available for this case
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    Add immunization records for this {selectedCaseType.label.toLowerCase()} case.
                  </p>
                </div>
              ) : (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Vaccine</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Date Given</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Next Due</th>
                        <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ textAlign: 'center', padding: '14px 16px', width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecordForTab('immunizations').map(imm => {
                        let status = 'Given', statusColor = '#059669', statusBg = '#D1FAE5'
                        if (imm.nextDueDate) {
                          const dueDate = new Date(imm.nextDueDate), today = new Date()
                          const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                          if (diffDays < 0) { status = 'Overdue'; statusColor = '#DC2626'; statusBg = '#FEE2E2' }
                          else if (diffDays <= 7) { status = 'Due Soon'; statusColor = '#D97706'; statusBg = '#FEF3C7' }
                        }
                        return (
                          <tr key={imm.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1E293B' }}>{imm.vaccineName}</td>
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>{formatDate(imm.dateGiven)}</td>
                            <td style={{ padding: '14px 16px', color: '#64748B' }}>{imm.nextDueDate ? formatDate(imm.nextDueDate) : 'N/A'}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: statusBg, color: statusColor }}>{status}</span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button 
                                onClick={() => onDeleteImmunization && onDeleteImmunization(patientId, imm.id)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Prenatal Schedule Tab */}
          {activeTab === 'prenatalSchedule' && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#DB2777', fontSize: '1rem' }} />
                </span>
                Prenatal Schedule
              </h3>
              {!prenatalScheduledDate ? (
                <div className="empty-state-mr">
                  <div className="empty-icon-mr"><FontAwesomeIcon icon={faCalendarCheck} size="2x" style={{ color: '#94A3B8' }} /></div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>
                    No schedule available
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                    No follow-up visits scheduled for this prenatal case.
                  </p>
                </div>
              ) : (
                <div className="data-card-mr" style={{ borderLeft: `4px solid ${selectedCaseType.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: selectedCaseType.color }}>#1</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedCaseType.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.8rem' }} />
                          {formatDate(prenatalScheduledDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)', borderRadius: '12px', border: '1px solid #F9A8D4' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#DB2777', textTransform: 'uppercase' }}>Next Visit Date</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#9D174D' }}>{formatDate(prenatalScheduledDate)}</p>
                    </div>
                    <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Time</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF' }}>{record?.prenatalData?.nextVisitTime || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', borderRadius: '12px', border: '1px solid #6EE7B7' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Location</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#047857' }}>{record?.prenatalData?.nextVisitLocation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'xray' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faXRay} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>X-Ray Reports</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Add chest X-ray reports for this TB case.</p>
            </div>
          )}

          {activeTab === 'adherence' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faCheckCircle} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Medication Adherence</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track DOTS medication adherence for this TB case.</p>
            </div>
          )}

          {activeTab === 'treatment' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faClipboardCheck} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Treatment Plan</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>View and manage TB treatment plan.</p>
            </div>
          )}

          {activeTab === 'followup' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faCalendarCheck} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Follow-up Schedule</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Schedule and track follow-up appointments.</p>
            </div>
          )}

            {activeTab === 'ultrasound' && getRecordForTab('ultrasound').length === 0 && (
              <div className="empty-state-mr">
                <div className="empty-icon-mr"><FontAwesomeIcon icon={faEye} size="2x" style={{ color: '#94A3B8' }} /></div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Ultrasound Results</h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Add prenatal ultrasound results.</p>
              </div>
            )}
            {activeTab === 'ultrasound' && getRecordForTab('ultrasound').length > 0 && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {getRecordForTab('ultrasound').map((us, idx) => (
                      <tr key={us.id || idx} style={{ borderTop: '1px solid #F1F5F9', padding: '12px 16px' }}>
                        <td style={{ padding: '12px 16px', color: '#1E293B' }}><strong>Date:</strong> {formatDate(us.date)}</td>
                        <td style={{ padding: '12px 16px', color: '#1E293B' }}><strong>Details:</strong> {JSON.stringify(us)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'trimester' && getRecordForTab('trimester').length === 0 && (
              <div className="empty-state-mr">
                <div className="empty-icon-mr"><FontAwesomeIcon icon={faCalendarCheck} size="2x" style={{ color: '#94A3B8' }} /></div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Trimester Monitoring</h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track pregnancy progress by trimester.</p>
              </div>
            )}
            {activeTab === 'trimester' && getRecordForTab('trimester').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {getRecordForTab('trimester').map((tri, idx) => {
                  const trimesterRecord = typeof tri === 'string' ? { trimester: tri } : (tri || {})
                  const visitDate = trimesterRecord.date || trimesterRecord.visitDate || trimesterRecord.dateOfVisit || trimesterRecord.recordDate || trimesterRecord.startDate || trimesterRecord.endDate || selectedCase?.records?.consultations?.[0]?.date
                  const gestationalAge = trimesterRecord.gestationalAge || trimesterRecord.gestationalWeek || trimesterRecord.gestationalWeeks || trimesterRecord.weeks || trimesterRecord.week || trimesterRecord.gestationAge
                  const trimesterValue = trimesterRecord.trimester || trimesterRecord.trimesterStage || trimesterRecord.trimesterLabel || 'N/A'
                  const normalizedTrimester = typeof trimesterValue === 'string' && /^\d(st|nd|rd|th)?$/i.test(trimesterValue)
                    ? `${trimesterValue.replace(/(st|nd|rd|th)$/i, '')}${trimesterValue.toLowerCase().match(/(st|nd|rd|th)$/)?.[1] || ''} Trimester`
                    : trimesterValue
                  const dueDate = trimesterRecord.dueDate || trimesterRecord.nextVisitDate || trimesterRecord.endDate
                  const riskLevel = trimesterRecord.riskLevel || trimesterRecord.risk || trimesterRecord.status || 'Normal'

                  return (
                    <div key={tri.id || idx} className="data-card-mr" style={{ borderLeft: `4px solid ${selectedCaseType.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: selectedCaseType.color }}>#{idx + 1}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedCaseType.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.8rem' }} />
                              {visitDate ? formatDate(visitDate) : 'No visit date'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', borderRadius: '12px', border: '1px solid #FECACA' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Gestational Age</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#7F1D1D' }}>{gestationalAge || 'N/A'} {gestationalAge ? 'weeks' : ''}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Trimester</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF' }}>{normalizedTrimester}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', borderRadius: '12px', border: '1px solid #6EE7B7' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Due Date</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#047857' }}>{dueDate ? formatDate(dueDate) : 'N/A'}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Risk Level</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#92400E' }}>{riskLevel}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'maternal' && getRecordForTab('maternal').length === 0 && (
              <div className="empty-state-mr">
                <div className="empty-icon-mr"><FontAwesomeIcon icon={faHeartPulse} size="2x" style={{ color: '#94A3B8' }} /></div>
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Maternal Vitals</h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Monitor maternal health vitals during pregnancy.</p>
              </div>
            )}
            {activeTab === 'maternal' && getRecordForTab('maternal').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {getRecordForTab('maternal').map((mat, idx) => {
                  const maternalRecord = typeof mat === 'string' ? { label: mat } : (mat || {})
                  const allMaternalRecords = getRecordForTab('maternal')

                  return (
                    <div key={maternalRecord.id || idx} className="data-card-mr" style={{ borderLeft: `4px solid ${selectedCaseType.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedCaseType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: selectedCaseType.color }}>#{allMaternalRecords.length - idx}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedCaseType.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '0.8rem' }} />
                              {formatDate(maternalRecord.date || maternalRecord.visitDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', borderRadius: '12px', border: '1px solid #FECACA' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Blood Pressure</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#7F1D1D' }}>{maternalRecord.bloodPressure || maternalRecord.bp || 'N/A'}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Weight</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF' }}>{maternalRecord.weight || 'N/A'}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', borderRadius: '12px', border: '1px solid #6EE7B7' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Temperature</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#047857' }}>{maternalRecord.temperature || 'N/A'}</p>
                        </div>
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Pulse Rate</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#92400E' }}>{maternalRecord.pulseRate || maternalRecord.pulse || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          {activeTab === 'bpMonitoring' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faHeartPulse} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Blood Pressure Monitoring</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track blood pressure readings for hypertension management.</p>
            </div>
          )}

          {activeTab === 'medication' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faPills} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Medication Logs</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track medication intake and adherence.</p>
            </div>
          )}

          {activeTab === 'glucose' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faMicroscope} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Glucose Monitoring</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track blood glucose levels for diabetes management.</p>
            </div>
          )}

          {activeTab === 'complications' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faExclamationTriangle} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Complications</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track and manage diabetes complications.</p>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faArrowUp} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Growth Monitoring</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track child's growth metrics.</p>
            </div>
          )}

          {activeTab === 'development' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faBaby} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Development Milestones</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Track child development milestones.</p>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="empty-state-mr">
              <div className="empty-icon-mr"><FontAwesomeIcon icon={faHospital} size="2x" style={{ color: '#94A3B8' }} /></div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>Referral Records</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Manage referral records for this case.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
