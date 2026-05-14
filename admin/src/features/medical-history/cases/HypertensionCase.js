import { CaseBase } from "./CaseBase"
import {
  faHeartPulse,
  faHeart,
  faClipboardList,
  faPills,
  faVial,
  faCalendarCheck,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown
} from "@fortawesome/free-solid-svg-icons"

export class HypertensionCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.dateDiagnosed = caseData.dateDiagnosed || null
    this.baselineBP = caseData.baselineBP || null
    this.riskLevel = caseData.riskLevel || 'Low'
    this.complications = caseData.complications || []

    this.id = caseData.id || 'hypertension'
    this.label = 'Hypertension'
    this.name = 'Hypertension Management'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Hypertension'
  }

  getName() {
    return 'Hypertension Management'
  }

  getColor() {
    return '#DC2626'
  }

  getBgColor() {
    return '#FEE2E2'
  }

  getGradient() {
    return 'linear-gradient(135deg, #DC2626, #B91C1C)'
  }

  getIcon() {
    return faHeartPulse
  }

  getStages() {
    return [
      { 
        id: 'assessment', 
        label: 'Assessment', 
        icon: faClipboardList,
        order: 1,
        description: 'Initial BP assessment and diagnosis'
      },
      { 
        id: 'monitoring', 
        label: 'Monitoring', 
        icon: faHeartPulse,
        order: 2,
        description: 'Regular BP monitoring'
      },
      { 
        id: 'maintenance', 
        label: 'Maintenance', 
        icon: faHeart,
        order: 3,
        description: 'Long-term management'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Consultations', icon: faClipboardList },
      { id: 'bpMonitoring', label: 'BP Monitoring', icon: faHeartPulse },
      { id: 'medication', label: 'Medication Logs', icon: faPills },
      { id: 'followup', label: 'Follow-up Visits', icon: faCalendarCheck },
      { id: 'labResults', label: 'Lab Results', icon: faVial }
    ]
  }

  getDefaultStage() {
    return 'assessment'
  }

  getDateDiagnosed() {
    return this.dateDiagnosed
  }

  setDateDiagnosed(date) {
    this.dateDiagnosed = date
    return this
  }

  getBaselineBP() {
    return this.baselineBP
  }

  setBaselineBP(bp) {
    this.baselineBP = bp
    return this
  }

  getRiskLevel() {
    return this.riskLevel
  }

  setRiskLevel(level) {
    this.riskLevel = level
    return this
  }

  getComplications() {
    return this.complications
  }

  addComplication(complication) {
    if (!this.complications.includes(complication)) {
      this.complications.push(complication)
    }
    return this
  }

  calculateCurrentStage() {
    const consultations = this.getRecords('consultations')
    const bpMonitoring = this.getRecords('bpMonitoring')

    if (consultations.length >= 3 || bpMonitoring.length >= 5) {
      return 'maintenance'
    }

    if (consultations.length >= 1 || bpMonitoring.length >= 1) {
      return 'monitoring'
    }

    return 'assessment'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('maintenance') || diagnosis.includes('controlled')) {
      return 'maintenance'
    }
    if (diagnosis.includes('monitoring') || diagnosis.includes('follow')) {
      return 'monitoring'
    }
    
    return 'monitoring'
  }

  calculateStage() {
    const bpRecords = this.getRecords('bpMonitoring')
    if (bpRecords.length < 5) return 1

    const recentBPs = bpRecords.slice(-5)
    const controlledCount = recentBPs.filter(bp => {
      const systolic = parseInt(bp.systolic)
      return systolic < 140
    }).length

    if (controlledCount >= 4) return 3
    if (controlledCount >= 2) return 2
    return 1
  }

  getBPTrend() {
    const bpMonitoring = this.getRecords('bpMonitoring')
    return bpMonitoring.map(bp => ({
      date: bp.date,
      systolic: bp.systolic,
      diastolic: bp.diastolic
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  getLatestBP() {
    const bpMonitoring = this.getRecords('bpMonitoring')
    if (bpMonitoring.length === 0) return null
    return bpMonitoring[bpMonitoring.length - 1]
  }

  isControlled() {
    const latestBP = this.getLatestBP()
    if (!latestBP) return null
    
    const systolic = parseInt(latestBP.systolic)
    const diastolic = parseInt(latestBP.diastolic)
    
    return systolic < 140 && diastolic < 90
  }

  addBPReading(data) {
    this.addRecord('bpMonitoring', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      systolic: data.systolic,
      diastolic: data.diastolic,
      pulse: data.pulse,
      remarks: data.remarks
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      dateDiagnosed: this.dateDiagnosed,
      baselineBP: this.baselineBP,
      riskLevel: this.riskLevel,
      complications: this.complications
    }
  }

  static getType() {
    return 'hypertension'
  }

  static getDescription() {
    return 'Hypertension monitoring and management'
  }

  static getStageLabels() {
    return {
      assessment: 'Assessment',
      monitoring: 'Monitoring',
      maintenance: 'Maintenance'
    }
  }
}

export default HypertensionCase