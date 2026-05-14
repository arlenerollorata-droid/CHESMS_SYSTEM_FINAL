const mongoose = require('mongoose');
require('./models/patient');
require('./models/record');
const connectDB = require('./config/db');
const recordController = require('./controllers/recordController');

async function test() {
  await connectDB();
  
  const req = { query: { category: 'All' } };
  const res = {
    json: (data) => {
      console.log(`Success! Returned ${data.length} records.`);
    },
    status: (code) => ({
      json: (data) => {
        console.log(`Error ${code}: ${data.message}`);
      }
    })
  };
  
  await recordController.getRecords(req, res);
  
  const MedicalRecord = mongoose.model('MedicalRecord');
  const records = await MedicalRecord.find();
  console.log(`Total Records in DB after test: ${records.length}`);
  
  process.exit();
}

test();
