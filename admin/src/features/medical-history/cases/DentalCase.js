import { CaseBase } from "./CaseBase"
import {
  faTooth,
  faClipboardList,
  faPills,
  faBone,
  faFirstAid,
  faCalendarCheck,
  faGrimace
} from "@fortawesome/free-solid-svg-icons"

export class DentalCase extends CaseBase {
  constructor(caseData = {}) {
    super(caseData)

    this.dateOfLastVisit = caseData.dateOfLastVisit || null
    this.dentalChart = caseData.dentalChart || {}
    this.lastPainScale = caseData.lastPainScale || 0

    this.id = caseData.id || 'dental'
    this.label = 'Dental'
    this.name = 'Dental Care'
    this.status = caseData.status || 'Active'
  }

  getLabel() {
    return 'Dental'
  }

  getName() {
    return 'Dental Care'
  }

  getColor() {
    return '#D97706'
  }

  getBgColor() {
    return '#FEF3C7'
  }

  getGradient() {
    return 'linear-gradient(135deg, #D97706, #B45309)'
  }

  getIcon() {
    return faTooth
  }

  getStages() {
    return [
      { 
        id: 'assessment', 
        label: 'Assessment', 
        icon: faClipboardList,
        order: 1,
        description: 'Initial dental examination'
      },
      { 
        id: 'treatment', 
        label: 'Treatment', 
        icon: faFirstAid,
        order: 2,
        description: 'Dental procedures done'
      },
      { 
        id: 'followup', 
        label: 'Follow-up', 
        icon: faCalendarCheck,
        order: 3,
        description: 'Recall visits'
      }
    ]
  }

  getTabs() {
    return [
      { id: 'consultations', label: 'Dental Visits', icon: faTooth },
      { id: 'treatments', label: 'Treatments', icon: faFirstAid },
      { id: 'extractions', label: 'Extractions', icon: faBone },
      { id: 'restorations', label: 'Restorations', icon: faFirstAid },
      { id: 'prescriptions', label: 'Prescriptions', icon: faPills },
      { id: 'followup', label: 'Follow-up', icon: faCalendarCheck }
    ]
  }

  getDefaultStage() {
    return 'assessment'
  }

  getDateOfLastVisit() {
    return this.dateOfLastVisit
  }

  setDateOfLastVisit(date) {
    this.dateOfLastVisit = date
    return this
  }

  getPainScale() {
    return this.lastPainScale
  }

  setPainScale(scale) {
    this.lastPainScale = Math.min(10, Math.max(0, scale))
    return this
  }

  getDentalChart() {
    return this.dentalChart
  }

  updateDentalChart(toothNumber, data) {
    this.dentalChart[toothNumber] = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    return this
  }

  calculateCurrentStage() {
    const treatments = this.getRecords('treatments')
    const extractions = this.getRecords('extractions')
    const restorations = this.getRecords('restorations')

    if (treatments.length > 0 || extractions.length > 0 || restorations.length > 0) {
      return 'treatment'
    }

    return 'assessment'
  }

  calculateStageFromRecord(record) {
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    
    if (diagnosis.includes('follow') || diagnosis.includes('recall')) {
      return 'followup'
    }
    if (diagnosis.includes('treatment') || diagnosis.includes('procedure')) {
      return 'treatment'
    }
    
    return 'assessment'
  }

  addTreatment(data) {
    this.addRecord('treatments', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      treatment: data.treatment,
      teeth: data.teeth,
      notes: data.notes
    })
    return this
  }

  addExtraction(data) {
    this.addRecord('extractions', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      toothNumber: data.toothNumber,
      reason: data.reason,
      anesthesia: data.anesthesia
    })
    return this
  }

  addRestoration(data) {
    this.addRecord('restorations', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      toothNumber: data.toothNumber,
      material: data.material,
      surface: data.surface
    })
    return this
  }

  toJSON() {
    return {
      ...super.toJSON(),
      dateOfLastVisit: this.dateOfLastVisit,
      dentalChart: this.dentalChart,
      lastPainScale: this.lastPainScale
    }
  }

  static getType() {
    return 'dental'
  }

  static getDescription() {
    return 'Dental care and oral health'
  }

  static getStageLabels() {
    return {
      assessment: 'Assessment',
      treatment: 'Treatment',
      followup: 'Follow-up'
    }
  }
}

export default DentalCase