const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testFullRecord() {
  try {
    console.log("Fetching full record for patient PAT-2026-9890...\n");
    
    const res = await axios.get(`${API_BASE}/records/PAT-2026-9890`);
    const record = res.data;
    
    console.log("=== PATIENT INFO ===");
    console.log(`Name: ${record.patientName}`);
    console.log(`ID: ${record.patientId}`);
    console.log(`Category: ${record.category}`);
    console.log(`Age: ${record.age}, Sex: ${record.sex}`);
    
    console.log("\n=== CASES ===");
    if (record.cases && record.cases.length > 0) {
      record.cases.forEach((caseItem, idx) => {
        console.log(`\nCase ${idx + 1}: ${caseItem.name} (ID: ${caseItem.id})`);
        if (caseItem.records) {
          const recordTypes = Object.keys(caseItem.records);
          recordTypes.forEach(type => {
            const count = Array.isArray(caseItem.records[type]) ? caseItem.records[type].length : 0;
            if (count > 0) {
              console.log(`  ${type}: ${count} records`);
              console.log(`    Data:`, JSON.stringify(caseItem.records[type], null, 2));
            }
          });
        }
      });
    } else {
      console.log("No cases found");
    }
    
    console.log("\n=== TOP-LEVEL RECORDS ===");
    console.log(`Consultations: ${record.consultations?.length || 0}`);
    console.log(`Prescriptions: ${record.prescriptions?.length || 0}`);
    console.log(`Lab Results: ${record.labResults?.length || 0}`);
    console.log(`Immunizations: ${record.immunizations?.length || 0}`);
    
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response?.data) {
      console.error("Response:", err.response.data);
    }
  }
}

testFullRecord();
