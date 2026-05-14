import { CaseBase } from "./CaseBase"
import {
  faSyringeAlt,
  faClipboardList,
  faCalendarCheck,
  faCheckCircle,
  faExclamationTriangle,
  faClock
} from "@fortawesome/free-solid-svg-icons"

export class ImmunizationCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.vaccineSchedule = caseData.vaccineSchedule || 'National'
    this.lastVaccine = caseData.lastVaccine || null
    this.nextDue = caseData.nextDue || null

    this.id = caseData.id || 'immunization'
    this.label = 'Immunization'
    this.name = 'Immunization'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Immunization'
  }

  getName() {
    return 'Immunization'
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
    return faSyringeAlt
  }

  getStages() {
    return [
      { 
        id: ' infancy', 
        label: 'Infancy', 
        icon: faSyringeAlt,
        order: 1,
        description: 'Birth to 12 months vaccines'
      },
      { 
        id: 'early', 
        label: 'Early Childhood', 
        icon: faClipboardList,
        order: 2,
        description: '12 months to 5 years vaccines'
      },
      { 
        id: 'school', 
        label: 'School Age', 
        icon: faCalendarCheck,
        order: 3,
        description: 'School entry vaccines'
      },
      { 
        id: 'adult', 
        label: 'Adult', 
        icon: faCheckCircle,
        order: 4,
        description: 'Adult booster vaccines'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'immunizations', label: 'Vaccinations', icon: faSyringeAlt },
      { id: 'due', label: 'Due Vaccines', icon: faClock },
      { id: 'history', label: 'History', icon: faClipboardList }
    ]
  }

  getDefaultStage() {
    return 'infancy'
  }

  getVaccineSchedule() {
    return this.vaccineSchedule
  }

  setVaccineSchedule(schedule) {
    this.vaccineSchedule = schedule
    return this
  }

  getLastVaccine() {
    return this.lastVaccine
  }

  getNextDue() {
    return this.nextDue
  }

  setNextDue(date) {
    this.nextDue = date
    return this
  }

  calculateCurrentStage() {
    const immunizations = this.getRecords('immunizations')
    
    if (immunizations.length === 0) {
      return 'infancy'
    }

    const latestDate = new Date(immunizations[immunizations.length - 1]?.date || 0)
    const now = new Date()
    const monthsAgo = (now - latestDate) / (1000 * 60 * 60 * 24 * 30)

    if (monthsAgo > 60) {
      return 'adult'
    }
    if (monthsAgo > 12) {
      return 'school'
    }
    if (monthsAgo > 5) {
      return 'early'
    }

    return 'infancy'
  }

  getVaccineSchedule() {
    return [
      { name: 'BCG', due: 'Birth', given: false },
      { name: 'HepB', due: 'Birth', given: false },
      { name: 'OPV0', due: 'Birth', given: false },
      { name: 'Pentavalent 1', due: '6 weeks', given: false },
      { name: 'OPV1', due: '6 weeks', given: false },
      { name: 'PCV1', due: '6 weeks', given: false },
      { name: 'Rotavirus1', due: '6 weeks', given: false },
      { name: 'Pentavalent 2', due: '10 weeks', given: false },
      { name: 'OPV2', due: '10 weeks', given: false },
      { name: 'Rotavirus2', due: '10 weeks', given: false },
      { name: 'Pentavalent 3', due: '14 weeks', given: false },
      { name: 'OPV3', due: '14 weeks', given: false },
      { name: 'PCV2', due: '14 weeks', given: false },
      { name: 'IPV', due: '14 weeks', given: false },
      { name: 'MMR 1', due: '9 months', given: false },
      { name: 'JE 1', due: '12 months', given: false },
      { name: 'MMR 2', due: '12 months', given: false },
      { name: 'Vitamin A', due: '9 months', given: false }
    ]
  }

  addImmunization(data) {
    this.addRecord('immunizations', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      vaccine: data.vaccine,
      lotNumber: data.lotNumber,
      site: data.site,
      route: data.route,
      performedBy: data.performedBy,
      nextDue: data.nextDue
    })

    this.lastVaccine = data.vaccine
    if (data.nextDue) {
      this.nextDue = data.nextDue
    }

    return this
  }

  getOverdueVaccines() {
    const today = new Date()
    const immunizations = this.getRecords('immunizations')
    
    return this.getVaccineSchedule().filter(vaccine => {
      if (vaccine.given) return false
      
      const vaccineRecord = immunizations.find(i => i.vaccine === vaccine.name)
      if (vaccineRecord) return false
      
      return true
    })
  }

  toJSON() {
    return {
      ...super.toJSON(),
      vaccineSchedule: this.vaccineSchedule,
      lastVaccine: this.lastVaccine,
      nextDue: this.nextDue
    }
  }

  static getType() {
    return 'immunization'
  }

  static getDescription() {
    return 'Immunization and vaccination records'
  }

  static getStageLabels() {
    return {
      infancy: 'Infancy',
      early: 'Early Childhood',
      school: 'School Age',
      adult: 'Adult'
    }
  }
}

export default ImmunizationCase