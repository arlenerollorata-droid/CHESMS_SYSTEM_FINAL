const axios = require('axios');

const API_URL = 'http://localhost:5000/api/patients';

// Test data for pediatric patient (only pediatricData should be sent)
const pediatricPatientPayload = {
  name: 'Test Pediatric Baby',
  birthdate: '2024-01-15',
  age: 2,
  gender: 'Male',
  civilStatus: 'Single',
  address: 'Test Street',
  barangay: 'Test Barangay',
  purok: 'Test Purok',
  contact: '09123456789',
  bloodType: 'O+',
  category: 'Pediatric',
  bp: '90/60',
  bloodSugar: 'N/A',
  weight: '14',
  height: '85',
  status: 'Active',
  emergencyContact: {
    name: 'Jane Doe',
    relation: 'Mother',
    phone: '09123456789'
  },
  medicalHistory: [],
  allergies: [],
  surgeries: [],
  medications: [],
  // ONLY pediatricData should be included for Pediatric category
  pediatricData: {
    babyFullName: 'Test Pediatric Baby',
    timeOfBirth: '14:30',
    placeOfBirth: 'Hospital',
    birthWeight: '3.5',
    birthLength: '50',
    deliveryType: 'Normal (NSD)',
    birthStatus: 'Alive at birth',
    hasComplications: 'No',
    complicationsNotes: '',
    vitaminKGiven: 'Yes',
    eyeOintmentGiven: 'Yes',
    breastfeedingStarted: 'Yes',
    newbornScreeningDone: 'Yes',
    bcgGiven: 'Yes',
    bcgDate: '2024-01-16',
    hepaBGiven: 'Yes',
    hepaBDate: '2024-01-16',
    firstCheckupDate: '2024-02-15',
    assignedHealthWorker: 'Health Worker 1',
    remarks: 'Healthy baby',
    school: '',
    grade: '',
    guardianName: 'Jane Doe',
    guardianRelation: 'Mother',
    guardianPhone: '09123456789',
    immunizationStatus: 'Complete'
  }
};

async function testPediatricRegistration() {
  try {
    console.log('Testing Pediatric Patient Registration...\n');
    console.log('Payload being sent:');
    console.log(JSON.stringify(pediatricPatientPayload, null, 2));
    console.log('\n---\n');

    const response = await axios.post(`${API_URL}/add`, pediatricPatientPayload);
    
    console.log('✅ SUCCESS! Pediatric patient registered successfully!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ ERROR during registration:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Full Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testPediatricRegistration().then(() => {
  console.log('\n✅ Test completed successfully!');
  process.exit(0);
});
