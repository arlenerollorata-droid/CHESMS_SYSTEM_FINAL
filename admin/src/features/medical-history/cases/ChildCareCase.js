import { CaseBase } from "./CaseBase"
import {
  faBaby,
  faClipboardList,
  faPills,
  faVial,
  faSyringe as faSyringeAlt,
  faArrowUp,
  faCalendarCheck,
  faGrowth
} from "@fortawesome/free-solid-svg-icons"

export class ChildCareCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.dateOfBirth = caseData.dateOfBirth || null
    this.birthWeight = caseData.birthWeight || null
    this.birthLength = caseData.birthLength || null
    this.apgarScore = caseData.apgarScore || null
    this.neonatalScreening = caseData.neonatalScreening || null

    this.id = caseData.id || 'childcare'
    this.label = 'Child Care'
    this.name = 'Child Care'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Child Care'
  }

  getName() {
    return 'Child Care'
  }

  getColor() {
    return '#059669'
  }

  getBgColor() {
    return '#D1FAE5'
  }

  getGradient() {
    return 'linear-gradient(135deg, #059669, #047857)'
  }

  getIcon() {
    return faBaby
  }

  getStages() {
    return [
      { 
        id: 'newborn', 
        label: 'Newborn', 
        icon: faBaby,
        order: 1,
        description: 'Initial newborn checkup'
      },
      { 
        id: 'wellbaby', 
        label: 'Well Baby', 
        icon: faCalendarCheck,
        order: 2,
        description: 'Regular well-baby checkups'
      },
      { 
        id: 'immunization', 
        label: 'Immunization', 
        icon: faSyringeAlt,
        order: 3,
        description: 'Vaccination schedule'
      },
      { 
        id: 'development', 
        label: 'Development', 
        icon: faGrowth,
        order: 4,
        description: 'Milestone tracking'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Checkups', icon: faClipboardList },
      { id: 'growth', label: 'Growth Monitoring', icon: faArrowUp },
      { id: 'development', label: 'Development', icon: faGrowth },
      { id: 'immunizations', label: 'Immunizations', icon: faSyringeAlt },
      { id: 'labResults', label: 'Lab Results', icon: faVial },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills }
    ]
  }

  getDefaultStage() {
    return 'newborn'
  }

  getDateOfBirth() {
    return this.dateOfBirth
  }

  setDateOfBirth(date) {
    this.dateOfBirth = date
    return this
  }

  getBirthWeight() {
    return this.birthWeight
  }

  getBirthLength() {
    return this.birthLength
  }

  getApgarScore() {
    return this.apgarScore
  }

  getAge() {
    if (!this.dateOfBirth) return null
    
    const today = new Date()
    const dob = new Date(this.dateOfBirth)
    const years = today.getFullYear() - dob.getFullYear()
    const months = today.getMonth() - dob.getMonth()
    
    if (years < 1) {
      const totalMonths = (today.getFullYear() - dob.getFullYear()) * 12 + months
      return totalMonths < 0 ? 0 : totalMonths
    }
    return years
  }

  getAgeInMonths() {
    if (!this.dateOfBirth) return null
    
    const today = new Date()
    const dob = new Date(this.dateOfBirth)
    return Math.floor((today - dob) / (1000 * 60 * 60 * 24 * 30))
  }

  calculateCurrentStage() {
    const immunizations = this.getRecords('immunizations')
    const growth = this.getRecords('growth')
    const consultations = this.getRecords('consultations')

    if (immunizations.length > 0) {
      return 'immunization'
    }

    if (growth.length > 0 || consultations.length > 2) {
      return 'wellbaby'
    }

    if (consultations.length > 0) {
      return 'newborn'
    }

    return 'newborn'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('development') || diagnosis.includes('milestone')) {
      return 'development'
    }
    if (diagnosis.includes('immunization') || diagnosis.includes('vaccine')) {
      return 'immunization'
    }
    if (diagnosis.includes('well baby') || diagnosis.includes('checkup')) {
      return 'wellbaby'
    }
    
    return 'newborn'
  }

  addGrowthRecord(data) {
    this.addRecord('growth', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      weight: data.weight,
      height: data.height,
      headCircumference: data.headCircumference,
      percentile: data.percentile
    })
    return this
  }

  getGrowthTrend() {
    const growth = this.getRecords('growth')
    return growth.map(g => ({
      date: g.date,
      weight: g.weight,
      height: g.height
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  addDevelopmentRecord(data) {
    this.addRecord('development', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      milestone: data.milestone,
      status: data.status,
      notes: data.notes
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      dateOfBirth: this.dateOfBirth,
      birthWeight: this.birthWeight,
      birthLength: this.birthLength,
      apgarScore: this.apgarScore,
      neonatalScreening: this.neonatalScreening
    }
  }

  static getType() {
    return 'childcare'
  }

  static getDescription() {
    return 'Child care and pediatric health'
  }

  static getStageLabels() {
    return {
      newborn: 'Newborn',
      wellbaby: 'Well Baby',
      immunization: 'Immunization',
      development: 'Development'
    }
  }
}

export default ChildCareCase