import {
  faStethoscope,
  faBabyCarriage,
  faBaby,
  faHeartPulse,
  faMicroscope,
  faLungs,
  faLungsVirus,
  faSyringe as faSyringeAlt,
  faTooth,
  faBalanceScale,
  faClipboardList,
  faCalendarAlt,
  faVial,
  faPills,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faHeart,
  faThermometer,
  faWeight,
  faUserHeart,
  faHandHoldingHeart,
  faBone,
  faFirstAid,
  faUserMd,
  faXRay
} from "@fortawesome/free-solid-svg-icons"

export class CaseBase {
  constructor(caseData = {}) {
    this.caseData = caseData
    this.id = caseData.id || null
    this.label = caseData.label || this.getLabel()
    this.name = caseData.name || this.getName()
    this.status = caseData.status || 'Active'
    this.records = caseData.records || {}
    this.dateCreated = caseData.dateCreated || new Date().toISOString().split('T')[0]
    this.currentStage = caseData.currentStage || this.getDefaultStage()
  }

  getId() {
    return this.id
  }

  getLabel() {
    return 'Case'
  }

  getName() {
    return 'General Case'
  }

  getColor() {
    return '#4169E1'
  }

  getBgColor() {
    return '#EEF2FF'
  }

  getGradient() {
    return 'linear-gradient(135deg, #4169E1, #1E40AF)'
  }

  getIcon() {
    return faStethoscope
  }

  getDefaultStage() {
    const stages = this.getStages()
    return stages.length > 0 ? stages[0].id : null
  }

  getStages() {
    return []
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Consultations', icon: faClipboardList },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
      { id: 'labResults', label: 'Lab Results', icon: faVial },
      { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt }
    ]
  }

  getRecords(recordType) {
    return this.records[recordType] || []
  }

  getAllRecords() {
    return this.records
  }

  getRecordCount(recordType) {
    return this.getRecords(recordType).length
  }

  getTotalRecordCount() {
    let total = 0
    Object.values(this.records).forEach(arr => {
      total += arr.length || 0
    })
    return total
  }

  getDateCreated() {
    return this.dateCreated
  }

  getStatus() {
    return this.status
  }

  getCurrentStage() {
    return this.currentStage
  }

  setCurrentStage(stageId) {
    this.currentStage = stageId
    return this
  }

  isActive() {
    return this.status === 'Active'
  }

  isComplete() {
    return this.status === 'Completed'
  }

  getStageInfo(stageId) {
    const stages = this.getStages()
    return stages.find(s => s.id === stageId) || null
  }

  getCurrentStageInfo() {
    return this.getStageInfo(this.currentStage)
  }

  calculateCurrentStage() {
    const records = this.getRecords('consultations')
    if (records.length === 0) {
      return this.getDefaultStage()
    }

    const latestRecord = records.reduce((latest, record) => {
      if (!latest || new Date(record.date) > new Date(latest.date)) {
        return record
      }
      return latest
    }, null)

    if (latestRecord) {
      return this.calculateStageFromRecord(latestRecord)
    }

    return this.getDefaultStage()
  }

  calculateStageFromRecord(record) {
    return this.getDefaultStage()
  }

  getStageProgress() {
    const stages = this.getStages()
    const currentIdx = stages.findIndex(s => s.id === this.currentStage)
    return {
      current: this.currentStage,
      currentIndex: currentIdx,
      total: stages.length,
      percentage: stages.length > 0 ? ((currentIdx + 1) / stages.length) * 100 : 0
    }
  }

  addRecord(recordType, record) {
    if (!this.records[recordType]) {
      this.records[recordType] = []
    }
    this.records[recordType].push({
      ...record,
      id: record.id || `${this.id}-${recordType}-${Date.now()}`,
      dateAdded: new Date().toISOString()
    })
    return this
  }

  removeRecord(recordType, recordId) {
    if (this.records[recordType]) {
      this.records[recordType] = this.records[recordType].filter(r => r.id !== recordId)
    }
    return this
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      name: this.name,
      status: this.status,
      records: this.records,
      dateCreated: this.dateCreated,
      currentStage: this.currentStage
    }
  }

  static getType() {
    return 'base'
  }

  static getDescription() {
    return 'General medical case'
  }
}

export const CASE_COLORS = {
  opd: { color: '#4169E1', bg: '#EEF2FF', gradient: 'linear-gradient(135deg, #4169E1, #1E40AF)' },
  prenatal: { color: '#DB2777', bg: '#FCE7F3', gradient: 'linear-gradient(135deg, #DB2777, #BE185D)' },
  childcare: { color: '#059669', bg: '#D1FAE5', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  hypertension: { color: '#DC2626', bg: '#FEE2E2', gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)' },
  diabetes: { color: '#7C3AED', bg: '#EDE9FE', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)' },
  tb: { color: '#4F46E5', bg: '#E0E7FF', gradient: 'linear-gradient(135deg, #4F46E5, #3730A3)' },
  immunization: { color: '#7C3AED', bg: '#EDE9FE', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)' },
  dental: { color: '#D97706', bg: '#FEF3C7', gradient: 'linear-gradient(135deg, #D97706, #B45309)' },
  familyplanning: { color: '#0891B2', bg: '#CFFAFE', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)' },
  nutrition: { color: '#0D9488', bg: '#CCFBF1', gradient: 'linear-gradient(135deg, #0D9488, #0F766E)' }
}

export default CaseBase