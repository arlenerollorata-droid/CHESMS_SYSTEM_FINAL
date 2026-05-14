const axios = require('axios');

const API_URL = 'http://localhost:5000/api/patients';

// Test data for prenatal patient (only prenatalData should be sent, not all case types)
const prenatalPatientPayload = {
  name: 'Test Prenatal Patient',
  birthdate: '1995-06-15',
  age: 29,
  gender: 'Female',
  civilStatus: 'Married',
  address: 'Test Street',
  barangay: 'Test Barangay',
  purok: 'Test Purok',
  contact: '09123456789',
  bloodType: 'O+',
  category: 'Prenatal',
  bp: '120/80',
  bloodSugar: '100',
  weight: '65',
  height: '165',
  status: 'Active',
  emergencyContact: {
    name: 'John Doe',
    relation: 'Husband',
    phone: '09123456789'
  },
  medicalHistory: [],
  allergies: [],
  surgeries: [],
  medications: [],
  // ONLY prenatalData should be included for Prenatal category
  prenatalData: {
    gestationalWeek: 20,
    trimester: '2nd Trimester',
    dueDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    riskLevel: 'Low Risk',
    progressPercent: 50,
    babyInsight: 'Normal development',
    nextVisitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextVisitTime: '10:00 AM',
    nextVisitLocation: 'Health Center',
    visitHistory: [
      {
        date: new Date(),
        week: '20',
        staff: 'BHW',
        notes: 'Initial prenatal visit'
      }
    ]
  }
};

async function testPrenatalRegistration() {
  try {
    console.log('Testing Prenatal Patient Registration...\n');
    console.log('Payload being sent:');
    console.log(JSON.stringify(prenatalPatientPayload, null, 2));
    console.log('\n---\n');

    const response = await axios.post(`${API_URL}/add`, prenatalPatientPayload);
    
    console.log('✅ SUCCESS! Patient registered successfully!');
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

testPrenatalRegistration().then(() => {
  console.log('\n✅ Test completed successfully!');
  process.exit(0);
});
