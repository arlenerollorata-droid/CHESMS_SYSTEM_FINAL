const mongoose = require('mongoose');
require('./models/patient');
require('./models/record');
const connectDB = require('./config/db');

async function check() {
  await connectDB();
  const Patient = mongoose.model('Patient');
  const MedicalRecord = mongoose.model('MedicalRecord');
  
  const patients = await Patient.find();
  console.log(`Total Patients: ${patients.length}`);
  patients.forEach(p => console.log(`- ${p.name} (${p.patientId}) [${p.category}]`));
  
  const records = await MedicalRecord.find();
  console.log(`Total Records: ${records.length}`);
  records.forEach(r => console.log(`- ${r.patientName} (${r.patientId})`));
  
  process.exit();
}

check();
