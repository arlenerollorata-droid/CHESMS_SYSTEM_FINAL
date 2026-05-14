import { CaseBase } from "./CaseBase"
import {
  faBabyCarriage,
  faUserHeart,
  faBaby,
  faCalendarCheck,
  faCheckCircle,
  faClipboardList,
  faVial,
  faPills,
  faSyringe as faSyringeAlt,
  faUltrasound,
  faHeartPulse,
  faThermometer,
  faWeight
} from "@fortawesome/free-solid-svg-icons"

export class PrenatalCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.lmp = caseData.lmp || null
    this.edd = caseData.edd || null
    this.gravida = caseData.gravida || 0
    this.parity = caseData.parity || 0
    this.riskLevel = caseData.riskLevel || 'Low'

    this.id = caseData.id || 'prenatal'
    this.label = 'Prenatal'
    this.name = 'Prenatal Care'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Prenatal'
  }

  getName() {
    return 'Prenatal Care'
  }

  getColor() {
    return '#DB2777'
  }

  getBgColor() {
    return '#FCE7F3'
  }

  getGradient() {
    return 'linear-gradient(135deg, #DB2777, #BE185D)'
  }

  getIcon() {
    return faBabyCarriage
  }

  getStages() {
    return [
      { 
        id: 'registration', 
        label: 'Registration', 
        icon: faClipboardList,
        order: 1,
        description: 'Pregnancy confirmation and initial registration'
      },
      { 
        id: 'prenatal', 
        label: 'Prenatal Care', 
        icon: faUserHeart,
        order: 2,
        description: 'Regular prenatal checkups during pregnancy'
      },
      { 
        id: 'delivery', 
        label: 'Delivery', 
        icon: faBaby,
        order: 3,
        description: 'During childbirth'
      },
      { 
        id: 'postnatal', 
        label: 'Post-natal', 
        icon: faCalendarCheck,
        order: 4,
        description: 'After delivery care'
      },
      { 
        id: 'immunization', 
        label: 'Immunization', 
        icon: faSyringeAlt,
        order: 5,
        description: "Baby's immunizations"
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Prenatal Checkups', icon: faUserHeart },
      { id: 'prenatalSchedule', label: 'Schedule', icon: faCalendarAlt },
      { id: 'ultrasound', label: 'Ultrasound', icon: faUltrasound },
      { id: 'maternal', label: 'Maternal Vitals', icon: faHeartPulse },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
      { id: 'labResults', label: 'Lab Results', icon: faVial },
      { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt }
    ]
  }

  getDefaultStage() {
    return 'registration'
  }

  getLMP() {
    return this.lmp
  }

  setLMP(lmp) {
    this.lmp = lmp
    if (lmp && !this.edd) {
      this.edd = this.calculateEDD(lmp)
    }
    return this
  }

  getEDD() {
    return this.edd
  }

  getGravida() {
    return this.gravida
  }

  setGravida(gravida) {
    this.gravida = gravida
    return this
  }

  getParity() {
    return this.parity
  }

  setParity(parity) {
    this.parity = parity
    return this
  }

  getRiskLevel() {
    return this.riskLevel
  }

  setRiskLevel(level) {
    this.riskLevel = level
    return this
  }

  calculateEDD(lmp) {
    if (!lmp) return null
    const lmpDate = new Date(lmp)
    const eddDate = new Date(lmpDate)
    eddDate.setDate(eddDate.getDate() + 280)
    return eddDate.toISOString().split('T')[0]
  }

  getTrimester() {
    if (!this.lmp) return null
    
    const today = new Date()
    const lmpDate = new Date(this.lmp)
    const weeks = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24 * 7))
    
    if (weeks < 13) return '1st'
    if (weeks < 27) return '2nd'
    return '3rd'
  }

  getWeeksPregnant() {
    if (!this.lmp) return null
    
    const today = new Date()
    const lmpDate = new Date(this.lmp)
    return Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24 * 7))
  }

  getDaysRemaining() {
    if (!this.edd) return null
    
    const today = new Date()
    const eddDate = new Date(this.edd)
    return Math.floor((eddDate - today) / (1000 * 60 * 60 * 24))
  }

  calculateCurrentStage() {
    const consultations = this.getRecords('consultations')
    const immunizations = this.getRecords('immunizations')
    const latestConsultation = consultations[consultations.length - 1]

    if (immunizations.length > 0) {
      return 'immunization'
    }

    if (latestConsultation) {
      const stageFromRecord = this.calculateStageFromRecord(latestConsultation)
      if (stageFromRecord) return stageFromRecord
    }

    const trimester = this.getTrimester()
    if (trimester === '3rd') {
      const daysRemaining = this.getDaysRemaining()
      if (daysRemaining !== null && daysRemaining <= 0) {
        return 'delivery'
      }
    }

    if (consultations.length >= 4 || (trimester && trimester !== '1st')) {
      return 'prenatal'
    }

    return 'registration'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('delivery') || diagnosis.includes('birth') || diagnosis.includes('labor')) {
      return 'delivery'
    }
    if (diagnosis.includes('postnatal') || diagnosis.includes('postpartum')) {
      return 'postnatal'
    }
    if (diagnosis.includes('immunization') || diagnosis.includes('vaccination')) {
      return 'immunization'
    }
    if (diagnosis.includes('prenatal') || diagnosis.includes('checkup')) {
      return 'prenatal'
    }
    
    return 'prenatal'
  }

  addPrenatalConsultation(data) {
    this.addRecord('consultations', {
      ...data,
      type: 'prenatal',
      trimester: this.getTrimester(),
      weeksPregnant: this.getWeeksPregnant()
    })
    return this
  }

  getVitals() {
    return this.getRecords('maternal') || []
  }

  addMaternalVitals(data) {
    this.addRecord('maternal', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      fundalHeight: data.fundalHeight,
      babyPosition: data.babyPosition,
      fetalHeartRate: data.fetalHeartRate,
      movements: data.movements
    })
    return this
  }

  getUltrasounds() {
    return this.getRecords('ultrasound') || []
  }

  addUltrasound(data) {
    this.addRecord('ultrasound', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      gestationalAge: data.gestationalAge,
      findings: data.findings,
      remarks: data.remarks
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      lmp: this.lmp,
      edd: this.edd,
      gravida: this.gravida,
      parity: this.parity,
      riskLevel: this.riskLevel
    }
  }

  static getType() {
    return 'prenatal'
  }

  static getDescription() {
    return 'Prenatal care for pregnant patients'
  }

  static getStageLabels() {
    return {
      registration: 'Registration',
      prenatal: 'Prenatal Care',
      delivery: 'Delivery',
      postnatal: 'Post-natal',
      immunization: 'Immunization'
    }
  }
}

export default PrenatalCase