#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('Detailed Record Check...\n');
    
    // Get the specific patient
    const patientId = 'PAT-2026-9890';
    
    // Test 1: Get record by patient ID
    console.log(`1. Fetching record for patient: ${patientId}`);
    try {
      const recordRes = await axios.get(`${API_BASE}/records/${patientId}`);
      console.log(`   ✓ Record found`);
      console.log(`   - Patient Name: ${recordRes.data.patientName}`);
      console.log(`   - Category: ${recordRes.data.category}`);
      console.log(`   - Cases: ${recordRes.data.cases?.length || 0}`);
      if (recordRes.data.cases && recordRes.data.cases.length > 0) {
        const caseData = recordRes.data.cases[0];
        console.log(`   - First Case ID: ${caseData.id}`);
        console.log(`   - First Case Name: ${caseData.name}`);
        console.log(`   - Records in case:`, Object.keys(caseData.records || {}));
      }
      console.log('\n✓ Record endpoint is working correctly');
      console.log('\nISSUE: If the admin console isn\'t showing records, it\'s likely:');
      console.log('1. Admin frontend might not be running');
      console.log('2. Admin frontend might have a display/rendering issue');
      console.log('3. Check browser console for errors');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ✗ Record NOT found for ${patientId}`);
      } else {
        throw error;
      }
    }
    
    // Test 2: Check category medical history endpoint
    console.log(`\n2. Fetching category-specific medical history...`);
    try {
      const catRes = await axios.get(`${API_BASE}/records/category-history/profile?patientId=${patientId}`);
      console.log('   ✓ Category medical history endpoint working');
      console.log(`   - Template Category: ${catRes.data.template.categoryName}`);
      console.log(`   - Sections: ${catRes.data.template.sections.length}`);
      console.log(`   - Patient Data Fields: ${Object.keys(catRes.data.patientData.categoryData).length}`);
    } catch (error) {
      console.log('   ✗ Error:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
