import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faTimes,
  faCheck,
  faStethoscope,
  faBaby,
  faLungs,
  faSyringe,
  faClipboardList,
  faHeartPulse,
  faTeeth,
  faUsers,
  faHeart,
  faMicroscope,
  faLungsVirus,
  faPlus,
  faUserInjured
} from "@fortawesome/free-solid-svg-icons"

const caseTypes = [
  { 
    id: 'prenatal', 
    label: 'Prenatal', 
    name: 'Prenatal Care',
    icon: faBaby, 
    color: '#DB2777', 
    bg: '#FCE7F3'
  },
  { 
    id: 'tb', 
    label: 'TB DOTS', 
    name: 'Tuberculosis DOTS',
    icon: faLungs, 
    color: '#4F46E5', 
    bg: '#E0E7FF'
  },
  { 
    id: 'pediatric', 
    label: 'Pediatric', 
    name: 'Child Care Services',
    icon: faUsers, 
    color: '#059669', 
    bg: '#D1FAE5'
  },
  { 
    id: 'immunization', 
    label: 'Immunization', 
    name: 'Immunization Services',
    icon: faSyringe, 
    color: '#7C3AED', 
    bg: '#EDE9FE'
  },
  { 
    id: 'dental', 
    label: 'Dental', 
    name: 'Dental Care',
    icon: faTeeth, 
    color: '#D97706', 
    bg: '#FEF3C7'
  },
  { 
    id: 'familyplanning', 
    label: 'Family Planning', 
    name: 'Family Planning Services',
    icon: faUsers, 
    color: '#0891B2', 
    bg: '#CFFAFE'
  },
  { 
    id: 'hypertension', 
    label: 'Hypertension', 
    name: 'Hypertension Management',
    icon: faHeart, 
    color: '#DC2626', 
    bg: '#FEE2E2'
  },
  { 
    id: 'diabetes', 
    label: 'Diabetes', 
    name: 'Diabetes Management',
    icon: faMicroscope, 
    color: '#7C3AED', 
    bg: '#EDE9FE'
  },
  { 
    id: 'asthma', 
    label: 'Asthma', 
    name: 'Asthma Management',
    icon: faLungsVirus, 
    color: '#059669', 
    bg: '#D1FAE5'
  },
  { 
    id: 'senior', 
    label: 'Senior', 
    name: 'Senior Care Services',
    icon: faUserInjured, 
    color: '#65A30D', 
    bg: '#ECFCCB'
  }
]

const RenderCaseForm = ({ type, formFields, handleInputChange }) => {
  switch (type.id) {
    case 'prenatal':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input type="number" name="gestationalWeek" value={formFields.gestationalWeek || ''} onChange={handleInputChange} placeholder="Gestational Week" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="trimester" value={formFields.trimester || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Trimester --</option>
            {["1st Trimester", "2nd Trimester", "3rd Trimester"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" name="dueDate" value={formFields.dueDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="riskLevel" value={formFields.riskLevel || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Risk Level --</option>
            {["Low Risk", "Moderate Risk", "High Risk"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="date" name="nextVisitDate" value={formFields.nextVisitDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'tb':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Start Date *</label>
            <input type="date" name="treatmentStartDate" value={formFields.treatmentStartDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          </div>
          <select name="treatmentPhase" value={formFields.treatmentPhase || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Phase * --</option>
            <option value="Intensive Phase">Intensive Phase</option>
            <option value="Continuation Phase">Continuation Phase</option>
          </select>
          <input name="regimen" value={formFields.regimen || ''} onChange={handleInputChange} placeholder="Regimen" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="prescription" value={formFields.prescription || ''} onChange={handleInputChange} placeholder="Prescription" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Next Visit Date *</label>
            <input type="date" name="nextVisitDate" value={formFields.nextVisitDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          </div>
        </div>
      )
    case 'pediatric':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <h4 style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Basic Baby Information</h4>
          <input name="babyFullName" value={formFields.babyFullName || ''} onChange={handleInputChange} placeholder="Baby Full Name *" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="time" name="timeOfBirth" value={formFields.timeOfBirth || ''} onChange={handleInputChange} placeholder="Time of Birth" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="sex" value={formFields.sex || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Sex * --</option>
            {["Male", "Female"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="placeOfBirth" value={formFields.placeOfBirth || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Place of Birth * --</option>
            {["Home", "Hospital", "Lying-in clinic"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <h4 style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Birth Details</h4>
          <input type="number" name="birthWeight" value={formFields.birthWeight || ''} onChange={handleInputChange} placeholder="Birth Weight *" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="birthLength" value={formFields.birthLength || ''} onChange={handleInputChange} placeholder="Birth Length (cm)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="typeOfDelivery" value={formFields.typeOfDelivery || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Type of Delivery * --</option>
            {["Normal (NSD)", "Cesarean (CS)", "Assisted"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="wasTheBaby" value={formFields.wasTheBaby || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Was the baby * --</option>
            {["Alive at birth", "Stillbirth"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select name="anyComplications" value={formFields.anyComplications || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Any Complications? * --</option>
            {["No", "Yes"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <h4 style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Newborn Health & Interventions</h4>
          <select name="vitaminK" value={formFields.vitaminK || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Vitamin K Given? * --</option>
            {["No", "Yes"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select name="eyeOintment" value={formFields.eyeOintment || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Eye Ointment Given? * --</option>
            {["No", "Yes"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select name="breastfeedingStarted" value={formFields.breastfeedingStarted || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Breastfeeding Started? * --</option>
            {["No", "Yes"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select name="newbornScreening" value={formFields.newbornScreening || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Newborn Screening? * --</option>
            {["No", "Yes", "Planned"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <h4 style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Immunization</h4>
          <select name="bcgGiven" value={formFields.bcgGiven || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- BCG Given? * --</option>
            {["No", "Yes"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select name="hepBGiven" value={formFields.hepBGiven || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Hep B Given? * --</option>
            {["No", "Yes"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <h4 style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Follow-Up / Tracking Info</h4>
          <input type="date" name="firstCheckupDate" value={formFields.firstCheckupDate || ''} onChange={handleInputChange} placeholder="First Check-up Date *" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="assignedHealthWorker" value={formFields.assignedHealthWorker || ''} onChange={handleInputChange} placeholder="Assigned Health Worker *" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="remarks" value={formFields.remarks || ''} onChange={handleInputChange} placeholder="Remarks" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '80px' }} />
        </div>
      )
    case 'immunization':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <select name="vaccineType" value={formFields.vaccineType || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Vaccine --</option>
            {["BCG", "Hepatitis B", "Pentavalent", "OPV", "IPV", "MMR", "PCV", "Rotavirus", "COVID-19", "Influenza", "HPV", "Tetanus Toxoid", "Anti-Rabies", "Vitamin A"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="doseNumber" value={formFields.doseNumber || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Dose --</option>
            {["Dose 1", "Dose 2", "Dose 3", "Booster 1", "Booster 2", "Single Dose"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="date" name="dateAdministered" value={formFields.dateAdministered || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="batchLot" value={formFields.batchLot || ''} onChange={handleInputChange} placeholder="Batch/Lot Number" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="vaccinator" value={formFields.vaccinator || ''} onChange={handleInputChange} placeholder="Vaccinator" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="injectionSite" value={formFields.injectionSite || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Injection Site --</option>
            {["Left Arm", "Right Arm", "Left Thigh", "Right Thigh", "Oral", "Intranasal"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" name="nextDoseSchedule" value={formFields.nextDoseSchedule || ''} onChange={handleInputChange} placeholder="Next Dose Schedule" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="adverseReaction" value={formFields.adverseReaction || ''} onChange={handleInputChange} placeholder="Adverse Reaction" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="immunizationStatus" value={formFields.immunizationStatus || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Status --</option>
            {["Completed", "Pending", "Overdue", "Partially Vaccinated", "Deferred", "Contraindicated"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea name="remarks" value={formFields.remarks || ''} onChange={handleInputChange} placeholder="Remarks" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'dental':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input name="chiefComplaint" value={formFields.chiefComplaint || ''} onChange={handleInputChange} placeholder="Chief Dental Complaint" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="oralExamination" value={formFields.oralExamination || ''} onChange={handleInputChange} placeholder="Oral Examination" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="affectedTooth" value={formFields.affectedTooth || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Affected Tooth --</option>
            {[...Array(32).keys()].map(i => <option key={i+1} value={`Tooth #${i+1}`}>Tooth #{i+1}</option>)}
          </select>
          <select name="dentalChart" value={formFields.dentalChart || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Dental Chart Status --</option>
            {["Decayed", "Missing", "Filled"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="procedureNeeded" value={formFields.procedureNeeded || ''} onChange={handleInputChange} placeholder="Procedures (Cleaning, Extraction, etc.)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="prescription" value={formFields.prescription || ''} onChange={handleInputChange} placeholder="Prescription (e.g. Amoxicillin 500mg)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="oralHygieneAdvice" value={formFields.oralHygieneAdvice || ''} onChange={handleInputChange} placeholder="Oral Hygiene Advice" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="nextVisit" value={formFields.nextVisit || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="dentistNotes" value={formFields.dentistNotes || ''} onChange={handleInputChange} placeholder="Dentist Notes" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'familyplanning':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <select name="methodChosen" value={formFields.methodChosen || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Method --</option>
            {["Pills", "Condom", "IUD", "Implant", "Injectable", "Natural Method"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="previousMethod" value={formFields.previousMethod || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Previous Method --</option>
            {["None", "Pills", "Injectable"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <textarea name="pregnancyHistory" value={formFields.pregnancyHistory || ''} onChange={handleInputChange} placeholder="Pregnancy History (e.g. G2P2)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="menstrualHistory" value={formFields.menstrualHistory || ''} onChange={handleInputChange} placeholder="Menstrual History" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="bp" value={formFields.bp || ''} onChange={handleInputChange} placeholder="Blood Pressure (e.g. 120/80)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="weight" value={formFields.weight || ''} onChange={handleInputChange} placeholder="Weight (kg)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="counselingProvided" value={formFields.counselingProvided || ''} onChange={handleInputChange} placeholder="Counseling Provided" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="sideEffects" value={formFields.sideEffects || ''} onChange={handleInputChange} placeholder="Side Effects" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="nextResupplyDate" value={formFields.nextResupplyDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="followUpDate" value={formFields.followUpDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="remarks" value={formFields.remarks || ''} onChange={handleInputChange} placeholder="Remarks" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'hypertension':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input name="bloodPressure" value={formFields.bloodPressure || ''} onChange={handleInputChange} placeholder="BP Reading (e.g. 150/95)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="pulseRate" value={formFields.pulseRate || ''} onChange={handleInputChange} placeholder="Pulse Rate (bpm)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="weight" value={formFields.weight || ''} onChange={handleInputChange} placeholder="Weight (kg)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input disabled placeholder={`BMI: ${formFields.weight && formFields.height ? (parseFloat(formFields.weight) / Math.pow(parseFloat(formFields.height)/100, 2)).toFixed(1) : "Auto-calc"}`} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F1F5F9' }} />
          <input name="medication" value={formFields.medication || ''} onChange={handleInputChange} placeholder="Medication (e.g. Losartan 50mg)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="smokingStatus" value={formFields.smokingStatus || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Smoking Status --</option>
            {["Non-Smoker", "Former Smoker", "Active Smoker"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="complications" value={formFields.complications || ''} onChange={handleInputChange} placeholder="Complications (Stroke, Kidney, etc.)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="nextCheck" value={formFields.nextCheck || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="doctorNotes" value={formFields.doctorNotes || ''} onChange={handleInputChange} placeholder="Doctor Notes" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'diabetes':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input type="number" name="fbs" value={formFields.fbs || ''} onChange={handleInputChange} placeholder="FBS (mg/dL)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="rbs" value={formFields.rbs || ''} onChange={handleInputChange} placeholder="RBS (mg/dL)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="hba1c" value={formFields.hba1c || ''} onChange={handleInputChange} placeholder="HbA1c (%)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="insulinUse" value={formFields.insulinUse || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Insulin Use --</option>
            {["Yes", "No"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="medication" value={formFields.medication || ''} onChange={handleInputChange} placeholder="Medication (e.g. Metformin 500mg)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="footExam" value={formFields.footExam || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Foot Exam --</option>
            {["Normal", "With Ulcer"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="eyeExam" value={formFields.eyeExam || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Eye Exam --</option>
            {["Normal", "Retinopathy"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="hypoglycemia" value={formFields.hypoglycemia || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Hypoglycemia Episodes --</option>
            {["None", "Mild", "Severe"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="complications" value={formFields.complications || ''} onChange={handleInputChange} placeholder="Complications (Neuropathy, Kidney, etc.)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="followUp" value={formFields.followUp || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="doctorNotes" value={formFields.doctorNotes || ''} onChange={handleInputChange} placeholder="Doctor Notes" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'asthma':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <select name="severity" value={formFields.severity || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Select Severity --</option>
            {["Intermittent", "Mild Persistent", "Moderate Persistent", "Severe Persistent"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="triggers" value={formFields.triggers || ''} onChange={handleInputChange} placeholder="Triggers (e.g. Dust, Smoke)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="peakFlow" value={formFields.peakFlow || ''} onChange={handleInputChange} placeholder="Peak Flow (L/min)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="number" name="oxygenSat" value={formFields.oxygenSat || ''} onChange={handleInputChange} placeholder="Oxygen Saturation (%)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="breathingAssessment" value={formFields.breathingAssessment || ''} onChange={handleInputChange} placeholder="Breathing Assessment" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="medication" value={formFields.medication || ''} onChange={handleInputChange} placeholder="Current Medication" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="nebulizationGiven" value={formFields.nebulizationGiven || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Nebulization Given --</option>
            {["Yes", "No"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="number" name="emergencyEpisodes" value={formFields.emergencyEpisodes || ''} onChange={handleInputChange} placeholder="Emergency Episodes" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="allergyHistory" value={formFields.allergyHistory || ''} onChange={handleInputChange} placeholder="Allergy History" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="smokingExposure" value={formFields.smokingExposure || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Smoking Exposure --</option>
            {["Yes", "No"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" name="followUpDate" value={formFields.followUpDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <textarea name="remarks" value={formFields.remarks || ''} onChange={handleInputChange} placeholder="Remarks" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    case 'senior':
      return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <select name="mobilityStatus" value={formFields.mobilityStatus || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Mobility Status --</option>
            {["Independent", "Assisted", "Bedridden"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="cognitiveAssessment" value={formFields.cognitiveAssessment || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Cognitive Assessment --</option>
            {["Normal", "Mild Impairment", "Dementia"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="visionAssessment" value={formFields.visionAssessment || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Vision Assessment --</option>
            {["Normal", "Blurred Vision", "Cataract"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="hearingAssessment" value={formFields.hearingAssessment || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Hearing Assessment --</option>
            {["Normal", "Partial Hearing Loss"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="medication" value={formFields.medication || ''} onChange={handleInputChange} placeholder="Maintenance Medication" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="fallRisk" value={formFields.fallRisk || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Fall Risk --</option>
            {["Low", "Moderate", "High"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="caregiverInfo" value={formFields.caregiverInfo || ''} onChange={handleInputChange} placeholder="Caregiver Information" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="chronicConditions" value={formFields.chronicConditions || ''} onChange={handleInputChange} placeholder="Chronic Conditions" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input name="vaccinationStatus" value={formFields.vaccinationStatus || ''} onChange={handleInputChange} placeholder="Vaccination Status" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <select name="nutritionAssessment" value={formFields.nutritionAssessment || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <option value="">-- Nutrition Assessment --</option>
            {["Normal", "Underweight", "Malnourished"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea name="mentalHealthNotes" value={formFields.mentalHealthNotes || ''} onChange={handleInputChange} placeholder="Mental Health Notes" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <input type="date" name="followUpDate" value={formFields.followUpDate || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
        </div>
      )
    default:
      return <textarea name="clinicalNotes" onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '100px' }} placeholder="Add initial remarks, observations, or clinical notes..." />
  }
}

export default function CaseTypeSelector({ isOpen, onClose, onSelect, existingCases = [] }) {
  const [selectedType, setSelectedType] = React.useState(null)
  const [formFields, setFormFields] = React.useState({})

  if (!isOpen) return null

  const availableCases = caseTypes.filter(type => !existingCases.includes(type.id))
  const existingCaseDetails = caseTypes.filter(type => existingCases.includes(type.id))

  const handleInputChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    onSelect(selectedType.id, formFields)
    setSelectedType(null)
    setFormFields({})
    onClose()
  }

  const handleClose = () => {
    setSelectedType(null)
    setFormFields({})
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          padding: '1.25rem 1.5rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FontAwesomeIcon icon={faClipboardList} />
              {selectedType ? `Clinical Profile: ${selectedType.label}` : 'Add New Cases'}
            </h2>
          </div>
          <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: 'calc(85vh - 100px)', overflowY: 'auto' }}>
          {!selectedType ? (
            <>
              {existingCaseDetails.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Current Cases</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {existingCaseDetails.map(type => (
                      <span key={type.id} style={{ padding: '6px 12px', background: type.bg, color: type.color, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                        <FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} />
                        {type.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Available Cases to Add</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {availableCases.map(type => (
                  <button key={type.id} onClick={() => setSelectedType(type)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'white', border: `2px solid ${type.bg}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FontAwesomeIcon icon={type.icon} style={{ fontSize: '1.2rem', color: type.color }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'block' }}>{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Fill in clinical details to add this case.</p>
              <RenderCaseForm type={selectedType} formFields={formFields} handleInputChange={handleInputChange} />
              <button onClick={handleSave} style={{ width: '100%', padding: '1rem', background: selectedType.color, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Add {selectedType.label} Case</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { caseTypes }
