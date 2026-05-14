import { CaseBase } from "./CaseBase"
import {
  faBalanceScale,
  faClipboardList,
  faPills,
  faUserMd,
  faCalendarCheck,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons"

export class FamilyPlanningCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.method = caseData.method || null
    this.dateStarted = caseData.dateStarted || null
    this.partnerStatus = caseData.partnerStatus || 'Unknown'
    this.children = caseData.children || 0

    this.id = caseData.id || 'familyplanning'
    this.label = 'Family Planning'
    this.name = 'Family Planning'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Family Planning'
  }

  getName() {
    return 'Family Planning'
  }

  getColor() {
    return '#0891B2'
  }

  getBgColor() {
    return '#CFFAFE'
  }

  getGradient() {
    return 'linear-gradient(135deg, #0891B2, #0E7490)'
  }

  getIcon() {
    return faBalanceScale
  }

  getStages() {
    return [
      { 
        id: 'counseling', 
        label: 'Counseling', 
        icon: faUserMd,
        order: 1,
        description: 'Initial family planning counseling'
      },
      { 
        id: 'method', 
        label: 'Method Use', 
        icon: faCheckCircle,
        order: 2,
        description: 'Contraceptive method in use'
      },
      { 
        id: 'followup', 
        label: 'Follow-up', 
        icon: faCalendarCheck,
        order: 3,
        description: 'Regular follow-up visits'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Visits', icon: faClipboardList },
      { id: 'methods', label: 'Contraceptives', icon: faCheckCircle },
      { id: 'counseling', label: 'Counseling', icon: faUserMd },
      { id: 'followup', label: 'Follow-up', icon: faCalendarCheck },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills }
    ]
  }

  getDefaultStage() {
    return 'counseling'
  }

  getMethod() {
    return this.method
  }

  setMethod(method) {
    this.method = method
    if (method && !this.dateStarted) {
      this.dateStarted = new Date().toISOString().split('T')[0]
    }
    return this
  }

  getDateStarted() {
    return this.dateStarted
  }

  getPartnerStatus() {
    return this.partnerStatus
  }

  setPartnerStatus(status) {
    this.partnerStatus = status
    return this
  }

  getChildren() {
    return this.children
  }

  setChildren(count) {
    this.children = count
    return this
  }

  calculateCurrentStage() {
    const methods = this.getRecords('methods')
    const followup = this.getRecords('followup')
    const counseling = this.getRecords('counseling')

    if (methods.length > 0 || (followup.length > 0)) {
      return 'method'
    }

    if (counseling.length > 0) {
      return 'counseling'
    }

    return 'counseling'
  }

  calculateStageFromRecord(record) {
    const topic = record.topic?.toLowerCase() || ''
    
    if (topic.includes('follow') || topic.includes('checkup')) {
      return 'followup'
    }
    if (topic.includes('method') || topic.includes('contraceptive')) {
      return 'method'
    }
    
    return 'counseling'
  }

  addMethodRecord(data) {
    this.addRecord('methods', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      method: data.method,
      startDate: data.startDate,
      notes: data.notes
    })
    if (data.method) {
      this.method = data.method
      this.dateStarted = data.startDate || data.date
    }
    return this
  }

  addCounseling(data) {
    this.addRecord('counseling', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      topic: data.topic,
      counselor: data.counselor,
      notes: data.notes
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      method: this.method,
      dateStarted: this.dateStarted,
      partnerStatus: this.partnerStatus,
      children: this.children
    }
  }

  static getType() {
    return 'familyplanning'
  }

  static getDescription() {
    return 'Family planning services'
  }

  static getStageLabels() {
    return {
      counseling: 'Counseling',
      method: 'Method Use',
      followup: 'Follow-up'
    }
  }

  static getMethodOptions() {
    return [
      { id: 'pills', label: 'Oral Contraceptives (Pills)' },
      { id: 'iud', label: 'IUD (Intrauterine Device)' },
      { id: 'condom', label: 'Condoms' },
      { id: 'injectable', label: 'Injectable (Depo)' },
      { id: 'implant', label: 'Implant (Nexplanon)' },
      { id: 'tubal', label: 'Tubal Ligation' },
      { id: 'vasectomy', label: 'Vasectomy' },
      { id: 'withdrawal', label: 'Withdrawal' },
      { id: 'rhythm', label: 'Rhythm Method' },
      { id: 'lactational', label: 'Lactational Amenorrhea' }
    ]
  }
}

export default FamilyPlanningCase