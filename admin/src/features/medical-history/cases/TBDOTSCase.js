import { CaseBase } from "./CaseBase"
import {
  faLungs,
  faMicroscope,
  faXRay,
  faCheckCircle,
  faCalendarCheck,
  faClipboardList,
  faPills,
  faVial,
  faExclamationTriangle,
  faThermometer,
  faWeight,
  faClock,
  faHeartPulse
} from "@fortawesome/free-solid-svg-icons"

export class TBDOTSCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.treatmentPhase = caseData.treatmentPhase || 'Intensive'
    this.site = caseData.site || 'Pulmonary'
    this.classification = caseData.classification || 'New'
    this.weight = caseData.weight || null
    this.sputumStatus = caseData.sputumStatus || null
    this.dateStarted = caseData.dateStarted || new Date().toISOString().split('T')[0]

    this.id = caseData.id || 'tb'
    this.label = 'TB DOTS'
    this.name = 'Tuberculosis DOTS'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'TB DOTS'
  }

  getName() {
    return 'Tuberculosis DOTS'
  }

  getColor() {
    return '#4F46E5'
  }

  getBgColor() {
    return '#E0E7FF'
  }

  getGradient() {
    return 'linear-gradient(135deg, #4F46E5, #3730A3)'
  }

  getIcon() {
    return faLungs
  }

  getStages() {
    return [
      { 
        id: 'initial', 
        label: 'Initial Phase', 
        icon: faClipboardList,
        order: 1,
        description: 'Intensive treatment phase (2 months)',
        duration: '2 months'
      },
      { 
        id: 'continuation', 
        label: 'Continuation Phase', 
        icon: faCalendarCheck,
        order: 2,
        description: 'Ongoing treatment phase (4 months)',
        duration: '4 months'
      },
      { 
        id: 'monitoring', 
        label: 'Monitoring', 
        icon: faMicroscope,
        order: 3,
        description: 'Regular sputum tests and monitoring',
        duration: 'Ongoing'
      },
      { 
        id: 'complete', 
        label: 'Treatment Complete', 
        icon: faCheckCircle,
        order: 4,
        description: 'Treatment ended successfully'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Consultations', icon: faClipboardList },
      { id: 'sputum', label: 'Sputum Results', icon: faMicroscope },
      { id: 'xray', label: 'X-Ray Reports', icon: faXRay },
      { id: 'adherence', label: 'Medication Adherence', icon: faCheckCircle },
      { id: 'treatment', label: 'Treatment Plan', icon: faPills },
      { id: 'followup', label: 'Follow-up Schedule', icon: faCalendarCheck },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
      { id: 'labResults', label: 'Lab Results', icon: faVial }
    ]
  }

  getDefaultStage() {
    return 'initial'
  }

  getTreatmentPhase() {
    return this.treatmentPhase
  }

  setTreatmentPhase(phase) {
    this.treatmentPhase = phase
    return this
  }

  getSite() {
    return this.site
  }

  setSite(site) {
    this.site = site
    return this
  }

  getClassification() {
    return this.classification
  }

  setClassification(classification) {
    this.classification = classification
    return this
  }

  getWeight() {
    return this.weight
  }

  setWeight(weight) {
    this.weight = weight
    return this
  }

  getSputumStatus() {
    return this.sputumStatus
  }

  setSputumStatus(status) {
    this.sputumStatus = status
    return this
  }

  getDateStarted() {
    return this.dateStarted
  }

  getTreatmentDuration() {
    const startDate = new Date(this.dateStarted)
    const today = new Date()
    const months = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30))
    return months
  }

  getRemainingTreatment() {
    const totalMonths = 6
    const currentMonths = this.getTreatmentDuration()
    return Math.max(0, totalMonths - currentMonths)
  }

  calculateCurrentStage() {
    const consultations = this.getRecords('consultations')
    const sputum = this.getRecords('sputum')
    const adherence = this.getRecords('adherence')
    
    const months = this.getTreatmentDuration()
    
    if (months >= 6) {
      return 'complete'
    }
    
    if (months >= 2) {
      return 'continuation'
    }
    
    if (sputum.length >= 2) {
      const latestSputum = sputum[sputum.length - 1]
      if (latestSputum?.result === 'Negative') {
        return 'monitoring'
      }
    }
    
    if (consultations.length >= 2) {
      return 'initial'
    }
    
    return 'initial'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('complete') || diagnosis.includes('cured')) {
      return 'complete'
    }
    if (diagnosis.includes('maintenance') || diagnosis.includes('continuation')) {
      return 'continuation'
    }
    if (diagnosis.includes('monitoring') || diagnosis.includes('follow')) {
      return 'monitoring'
    }
    
    return 'initial'
  }

  getSputumSchedule() {
    return [
      { month: 0, label: 'Month 0 (Baseline)', required: true },
      { month: 2, label: 'Month 2', required: true },
      { month: 5, label: 'Month 5', required: true },
      { month: 6, label: 'Month 6 (End)', required: true }
    ]
  }

  checkConversion() {
    const sputum = this.getRecords('sputum')
    if (sputum.length === 0) return null
    
    const latest = sputum[sputum.length - 1]
    return latest?.result === 'Negative'
  }

  getAdherenceRate() {
    const adherence = this.getRecords('adherence')
    if (adherence.length === 0) return 0
    
    const taken = adherence.filter(a => a.status === 'Taken').length
    return Math.round((taken / adherence.length) * 100)
  }

  addSputumResult(data) {
    this.addRecord('sputum', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      result: data.result,
      remarks: data.remarks,
      microscopist: data.microscopist
    })
    
    if (data.result === 'Negative') {
      this.sputumStatus = 'Negative'
    } else {
      this.sputumStatus = 'Positive'
    }
    
    return this
  }

  addXRay(data) {
    this.addRecord('xray', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      findings: data.findings,
      remarks: data.remarks,
      facility: data.facility
    })
    return this
  }

  addAdherence(data) {
    this.addRecord('adherence', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status,
      supervisedBy: data.supervisedBy,
      notes: data.notes
    })
    return this
  }

  addTreatmentRecord(data) {
    this.addRecord('treatment', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      phase: data.phase,
      medications: data.medications,
      weight: data.weight
    })
    return this
  }

  getWeightTrend() {
    const treatment = this.getRecords('treatment')
    return treatment.map(t => ({
      date: t.date,
      weight: t.weight
    })).filter(t => t.weight)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      treatmentPhase: this.treatmentPhase,
      site: this.site,
      classification: this.classification,
      weight: this.weight,
      sputumStatus: this.sputumStatus,
      dateStarted: this.dateStarted
    }
  }

  static getType() {
    return 'tb'
  }

  static getDescription() {
    return 'Tuberculosis DOTS treatment'
  }

  static getStageLabels() {
    return {
      initial: 'Initial Phase',
      continuation: 'Continuation Phase',
      monitoring: 'Monitoring',
      complete: 'Treatment Complete'
    }
  }
}

export default TBDOTSCase