export const CASE_CATEGORIES = {
  'Prenatal': {
    color: '#EC4899',
    bg: '#FCE7F3',
    cases: ['Prenatal Checkup', 'Postpartum Checkup', 'Prenatal Ultrasound'],
    consecutive: true,
    description: 'Pregnancy-related visits'
  },
  'Immunization': {
    color: '#8B5CF6',
    bg: '#EDE9FE',
    cases: ['Vaccination', 'Booster Shot', 'Immunization Review'],
    consecutive: false,
    description: 'Vaccination services'
  },
  'Pediatric': {
    color: '#10B981',
    bg: '#D1FAE5',
    cases: ['Well Baby', 'Sick Child', 'Growth Monitoring', 'Developmental Check'],
    consecutive: false,
    description: 'Child health services'
  },
  'General': {
    color: '#3B82F6',
    bg: '#DBEAFE',
    cases: ['General Consultation', 'Follow-up Visit', 'BP Monitoring', 'Temperature Check', 'Health Assessment'],
    consecutive: false,
    description: 'General medical services'
  },
  'Dental': {
    color: '#F59E0B',
    bg: '#FEF3C7',
    cases: ['Dental Checkup', 'Tooth Extraction', 'Dental Cleaning', 'Dental Filling'],
    consecutive: false,
    description: 'Dental health services'
  },
  'Family Planning': {
    color: '#06B6D4',
    bg: '#CFFAFE',
    cases: ['FP Counseling', 'Condom Distribution', 'Pills Issuance', 'IUD Insertion', 'Nodular Injection'],
    consecutive: false,
    description: 'Family planning services'
  },
  'Senior': {
    color: '#84CC16',
    bg: '#ECFCCB',
    cases: ['Senior Checkup', 'Geriatric Assessment', 'Vision Test', 'Hearing Test'],
    consecutive: false,
    description: 'Senior citizen services'
  },
  'NCD': {
    color: '#EF4444',
    bg: '#FEE2E2',
    cases: ['Hypertension Monitoring', 'Diabetes Check', 'Asthma Review', 'Heart Disease Follow-up'],
    consecutive: true,
    description: 'Non-communicable disease management'
  },
  'TB DOTS': {
    color: '#6366F1',
    bg: '#E0E7FF',
    cases: ['TB Screening', 'TB Treatment', 'TB Medicine Issuance', 'TB Follow-up'],
    consecutive: true,
    description: 'Tuberculosis treatment'
  },
  'Nutrition': {
    color: '#14B8A6',
    bg: '#CCFBF1',
    cases: ['Nutritional Assessment', 'Weight Monitoring', 'Nutritional Counseling', 'Vitamin Distribution'],
    consecutive: false,
    description: 'Nutrition services'
  }
}

export const PROTOCOLS = {
  'Prenatal Checkup': [
    { visit: 1, weeks: 12, focus: 'Initial assessment & registration' },
    { visit: 2, weeks: 16, focus: 'Genetic screening discussion' },
    { visit: 3, weeks: 20, focus: 'Anatomy scan (Level 2 ultrasound)' },
    { visit: 4, weeks: 24, focus: 'Glucose tolerance test' },
    { visit: 5, weeks: 28, focus: 'Rhogham injection (if needed)' },
    { visit: 6, weeks: 32, focus: 'Growth assessment' },
    { visit: 7, weeks: 36, focus: 'Bishop score & labor preparation' },
    { visit: 8, weeks: 38, focus: 'Delivery planning' },
    { visit: 9, weeks: 40, focus: 'Post-term management' }
  ],
  'Well Baby': [
    { visit: 1, weeks: 0, focus: 'Newborn screening & birth visit' },
    { visit: 2, weeks: 2, focus: '2-week checkup' },
    { visit: 3, weeks: 4, focus: '1-month visit' },
    { visit: 4, weeks: 8, focus: '2-month visit (Vaccines)' },
    { visit: 5, weeks: 12, focus: '3-month visit' },
    { visit: 6, weeks: 16, focus: '4-month visit (Vaccines)' }
  ],
  'Hypertension Monitoring': [
    { visit: 1, weeks: 0, focus: 'Initial BP assessment' },
    { visit: 2, weeks: 2, focus: 'BP recheck & medication review' },
    { visit: 3, weeks: 4, focus: 'BP monitoring & lifestyle counseling' },
    { visit: 4, weeks: 8, followUp: true, focus: 'Follow-up visit' },
    { visit: 5, weeks: 12, followUp: true, focus: 'Quarterly review' }
  ],
  'Diabetes Check': [
    { visit: 1, weeks: 0, focus: 'Blood sugar assessment' },
    { visit: 2, weeks: 2, focus: 'Glucose monitoring review' },
    { visit: 3, weeks: 4, focus: 'HbA1c test & medication adjustment' },
    { visit: 4, weeks: 12, followUp: true, focus: 'Quarterly review' }
  ],
  'TB Treatment': [
    { visit: 1, weeks: 0, focus: 'TB diagnosis & treatment initiation' },
    { visit: 2, weeks: 2, focus: '2-week follow-up' },
    { visit: 3, weeks: 4, focus: '1-month assessment' },
    { visit: 4, weeks: 8, focus: '2-month evaluation' },
    { visit: 5, weeks: 12, focus: '3-month milestone' },
    { visit: 6, weeks: 24, focus: '6-month completion' }
  ]
}

export const SCHEDULE_TYPES = [
  'Scheduled Appointment',
  'Walk-in',
  'Follow-up',
  'Home Visit',
  'Telemedicine'
]

export const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
]

export const URGENCY_LEVELS = [
  { value: 'Normal', label: 'Normal', color: '#64748B', bg: '#F1F5F9' },
  { value: 'Urgent', label: 'Urgent', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'Emergency', label: 'Emergency', color: '#EF4444', bg: '#FEE2E2' }
]

export const APPOINTMENT_STATUS = [
  { value: 'Pending', label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'Confirmed', label: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE' },
  { value: 'In Progress', label: 'In Progress', color: '#8B5CF6', bg: '#EDE9FE' },
  { value: 'Completed', label: 'Completed', color: '#10B981', bg: '#D1FAE5' },
  { value: 'No-show', label: 'No-show', color: '#64748B', bg: '#F1F5F9' },
  { value: 'Cancelled', label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' }
]

export const LOCATIONS = [
  'Health Center',
  'Barangay Hall',
  'Home Visit',
  'Satellite Clinic',
  'School'
]

export const SERVICE_DURATION = {
  'General Consultation': 15,
  'Prenatal Checkup': 30,
  'Immunization': 15,
  'Dental Checkup': 30,
  'BP Monitoring': 10,
  'Well Baby': 20,
  'Follow-up Visit': 10,
  'NCD Monitoring': 20
}
