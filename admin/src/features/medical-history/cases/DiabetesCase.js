import { CaseBase } from "./CaseBase"
import {
  faMicroscope,
  faClipboardList,
  faPills,
  faVial,
  faCalendarCheck,
  faExclamationTriangle,
  faEye,
  faHeart,
  faUserHeart,
  faClock
} from "@fortawesome/free-solid-svg-icons"

export class DiabetesCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.type = caseData.type || 'Type 2'
    this.dateDiagnosed = caseData.dateDiagnosed || null
    this.hba1c = caseData.hba1c || null
    this.complications = caseData.complications || []

    this.id = caseData.id || 'diabetes'
    this.label = 'Diabetes'
    this.name = 'Diabetes Management'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Diabetes'
  }

  getName() {
    return 'Diabetes Management'
  }

  getColor() {
    return '#7C3AED'
  }

  getBgColor() {
    return '#EDE9FE'
  }

  getGradient() {
    return 'linear-gradient(135deg, #7C3AED, #5B21B6)'
  }

  getIcon() {
    return faMicroscope
  }

  getStages() {
    return [
      { 
        id: 'initial', 
        label: 'Initial Assessment', 
        icon: faClipboardList,
        order: 1,
        description: 'Blood sugar diagnosis and initial assessment'
      },
      { 
        id: 'monitoring', 
        label: 'Monitoring', 
        icon: faMicroscope,
        order: 2,
        description: 'Regular glucose checks'
      },
      { 
        id: 'complications', 
        label: 'Complication Check', 
        icon: faExclamationTriangle,
        order: 3,
        description: 'Eye, kidney, nerve checks'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Consultations', icon: faClipboardList },
      { id: 'glucose', label: 'Glucose Monitoring', icon: faMicroscope },
      { id: 'medication', label: 'Medication Logs', icon: faPills },
      { id: 'complications', label: 'Complications', icon: faExclamationTriangle },
      { id: 'labResults', label: 'Lab Results', icon: faVial },
      { id: 'followup', label: 'Follow-up Schedule', icon: faCalendarCheck }
    ]
  }

  getDefaultStage() {
    return 'initial'
  }

  getType() {
    return this.type
  }

  setType(type) {
    this.type = type
    return this
  }

  getDateDiagnosed() {
    return this.dateDiagnosed
  }

  setDateDiagnosed(date) {
    this.dateDiagnosed = date
    return this
  }

  getHbA1c() {
    return this.hba1c
  }

  setHbA1c(hba1c) {
    this.hba1c = hba1c
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
    const glucose = this.getRecords('glucose')

    if (consultations.length >= 3 || glucose.length >= 10) {
      return 'complications'
    }

    if (consultations.length >= 1 || glucose.length >= 1) {
      return 'monitoring'
    }

    return 'initial'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('complication') || diagnosis.includes('eye') || diagnosis.includes('kidney')) {
      return 'complications'
    }
    if (diagnosis.includes('monitoring') || diagnosis.includes('follow')) {
      return 'monitoring'
    }
    
    return 'monitoring'
  }

  calculateStage() {
    const glucose = this.getRecords('glucose')
    if (glucose.length < 5) return 1

    const recentGlucose = glucose.slice(-5)
    const controlledCount = recentGlucose.filter(g => {
      const value = parseInt(g.value)
      return value < 140
    }).length

    if (controlledCount >= 4) return 3
    if (controlledCount >= 2) return 2
    return 1
  }

  getGlucoseTrend() {
    const glucose = this.getRecords('glucose')
    return glucose.map(g => ({
      date: g.date,
      value: g.value,
      type: g.type || 'Random'
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  getLatestGlucose() {
    const glucose = this.getRecords('glucose')
    if (glucose.length === 0) return null
    return glucose[glucose.length - 1]
  }

  isControlled() {
    const latestGlucose = this.getLatestGlucose()
    if (!latestGlucose) return null
    
    const value = parseInt(latestGlucose.value)
    const type = latestGlucose.type || 'Random'
    
    if (type === 'Fasting') return value < 126
    if (type === 'Random') return value < 200
    if (type === '2h PP') return value < 200
    return value < 140
  }

  addGlucoseReading(data) {
    this.addRecord('glucose', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      value: data.value,
      type: data.type || 'Random',
      unit: data.unit || 'mg/dL',
      remarks: data.remarks
    })
    return this
  }

  addComplicationRecord(data) {
    this.addRecord('complications', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type,
      severity: data.severity,
      notes: data.notes
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      dateDiagnosed: this.dateDiagnosed,
      hba1c: this.hba1c,
      complications: this.complications
    }
  }

  static getType() {
    return 'diabetes'
  }

  static getDescription() {
    return 'Diabetes monitoring and management'
  }

  static getStageLabels() {
    return {
      initial: 'Initial Assessment',
      monitoring: 'Monitoring',
      complications: 'Complication Check'
    }
  }
}

export default DiabetesCase