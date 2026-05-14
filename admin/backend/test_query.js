const mongoose = require('mongoose');
require('./models/patient');
require('./models/record');
const connectDB = require('./config/db');

async function check() {
  await connectDB();
  const Patient = mongoose.model('Patient');
  const MedicalRecord = mongoose.model('MedicalRecord');
  
  const search = "";
  const category = "All";
  
  let patientQuery = {};
  if (search) {
    patientQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category && category !== 'All') {
    if (category === 'General') {
      patientQuery.$or = [
        ...(patientQuery.$or || []),
        { category: 'OPD' },
        { category: 'Consultation' },
        { category: { $exists: false } }
      ];
    } else if (category === 'NCD') {
      patientQuery.$or = [
        ...(patientQuery.$or || []),
        { category: 'NCD' },
        { category: 'Hypertension' },
        { category: 'Diabetes' },
        { category: 'Asthma' }
      ];
    } else {
      patientQuery.category = category;
    }
  }
  
  console.log("Patient Query:", JSON.stringify(patientQuery));
  const allPatients = await Patient.find(patientQuery);
  console.log(`Found ${allPatients.length} patients matching query`);
  
  process.exit();
}

check();
