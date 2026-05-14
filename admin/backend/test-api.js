#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('Testing CHESMS API...\n');
    
    // Test 1: Get all patients
    console.log('1. Fetching all patients...');
    const patientsRes = await axios.get(`${API_BASE}/patients`);
    console.log(`   ✓ Found ${patientsRes.data.length} patients`);
    if (patientsRes.data.length > 0) {
      const p = patientsRes.data[0];
      console.log(`   First patient: ${p.patientId} | ${p.name} | Category: ${p.category}`);
    }
    
    // Test 2: Get all medical records
    console.log('\n2. Fetching all medical records...');
    const recordsRes = await axios.get(`${API_BASE}/records`);
    console.log(`   ✓ Found ${recordsRes.data.length} medical records`);
    if (recordsRes.data.length > 0) {
      const r = recordsRes.data[0];
      console.log(`   First record: ${r.patientId} | ${r.patientName} | Category: ${r.category}`);
      console.log(`   Cases: ${r.cases?.length || 0}`);
    } else {
      console.log('   ⚠ WARNING: No medical records found!');
    }
    
    // Test 3: If there are patients but no records, show discrepancy
    if (patientsRes.data.length > 0 && recordsRes.data.length === 0) {
      console.log('\n⚠ ISSUE FOUND: Patients exist but no medical records!');
      console.log('   This means patient records are created but medical records are NOT being initialized.');
      console.log(`   Try creating a medical record for the first patient: ${patientsRes.data[0].patientId}`);
    } else if (patientsRes.data.length === recordsRes.data.length) {
      console.log('\n✓ All patients have medical records');
    } else {
      console.log(`\n⚠ Record count mismatch: ${patientsRes.data.length} patients but ${recordsRes.data.length} records`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
