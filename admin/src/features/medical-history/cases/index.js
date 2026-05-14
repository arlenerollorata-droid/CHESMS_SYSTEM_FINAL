export { CaseBase, CASE_COLORS } from './CaseBase'
export { OPDCase } from './OPDCase'
export { PrenatalCase } from './PrenatalCase'
export { TBDOTSCase } from './TBDOTSCase'
export { HypertensionCase } from './HypertensionCase'
export { DiabetesCase } from './DiabetesCase'
export { ChildCareCase } from './ChildCareCase'
export { DentalCase } from './DentalCase'
export { FamilyPlanningCase } from './FamilyPlanningCase'
export { NutritionCase } from './NutritionCase'
export { ImmunizationCase } from './ImmunizationCase'

export const CASE_REGISTRY = {
  opd: {
    class: OPDCase,
    type: 'opd',
    label: 'OPD',
    name: 'General OPD',
    description: 'General outpatient consultations and treatment'
  },
  prenatal: {
    class: PrenatalCase,
    type: 'prenatal',
    label: 'Prenatal',
    name: 'Prenatal Care',
    description: 'Pregnancy care including prenatal checkups, delivery, and post-natal care'
  },
  childcare: {
    class: ChildCareCase,
    type: 'childcare',
    label: 'Child Care',
    name: 'Child Care',
    description: 'Pediatric health care includingimmunizations and development monitoring'
  },
  hypertension: {
    class: HypertensionCase,
    type: 'hypertension',
    label: 'Hypertension',
    name: 'Hypertension',
    description: 'Blood pressure monitoring and hypertension management'
  },
  diabetes: {
    class: DiabetesCase,
    type: 'diabetes',
    label: 'Diabetes',
    name: 'Diabetes',
    description: 'Blood sugar monitoring and diabetes management'
  },
  tb: {
    class: TBDOTSCase,
    type: 'tb',
    label: 'TB DOTS',
    name: 'Tuberculosis DOTS',
    description: 'Tuberculosis treatment with direct observation therapy'
  },
  immunization: {
    class: ImmunizationCase,
    type: 'immunization',
    label: 'Immunization',
    name: 'Immunization',
    description: 'Vaccination records and vaccine scheduling'
  },
  dental: {
    class: DentalCase,
    type: 'dental',
    label: 'Dental',
    name: 'Dental Care',
    description: 'Dental checkups, treatments, and oral health'
  },
  familyplanning: {
    class: FamilyPlanningCase,
    type: 'familyplanning',
    label: 'Family Planning',
    name: 'Family Planning',
    description: 'Contraceptive counseling and family planning services'
  },
  nutrition: {
    class: NutritionCase,
    type: 'nutrition',
    label: 'Nutrition',
    name: 'Nutrition',
    description: 'Nutritional assessment and diet counseling'
  }
}

export const CASE_TYPE_LIST = [
  { type: 'opd', label: 'OPD', name: 'General OPD', description: 'General outpatient consultations' },
  { type: 'prenatal', label: 'Prenatal', name: 'Prenatal Care', description: 'Pregnancy care' },
  { type: 'childcare', label: 'Child Care', name: 'Child Care', description: 'Pediatric health' },
  { type: 'hypertension', label: 'Hypertension', name: 'Hypertension', description: 'BP monitoring' },
  { type: 'diabetes', label: 'Diabetes', name: 'Diabetes', description: 'Sugar monitoring' },
  { type: 'tb', label: 'TB DOTS', name: 'Tuberculosis DOTS', description: 'TB treatment' },
  { type: 'immunization', label: 'Immunization', name: 'Immunization', description: 'Vaccinations' },
  { type: 'dental', label: 'Dental', name: 'Dental Care', description: 'Oral health' },
  { type: 'familyplanning', label: 'Family Planning', name: 'Family Planning', description: 'Contraceptives' },
  { type: 'nutrition', label: 'Nutrition', name: 'Nutrition', description: 'Diet counseling' }
]

export const createCase = (caseType, caseData = {}) => {
  const registry = CASE_REGISTRY[caseType]
  if (!registry) {
    console.error(`Case type "${caseType}" not found in registry`)
    return null
  }
  return new registry.class(caseData)
}

export const getCaseClass = (caseType) => {
  const registry = CASE_REGISTRY[caseType]
  return registry ? registry.class : null
}

export const getCaseInfo = (caseType) => {
  return CASE_TYPE_LIST.find(c => c.type === caseType) || null
}

export default CASE_TYPE_LIST