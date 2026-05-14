const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testCategoryEndpoint() {
  try {
    console.log("Testing category medical history endpoint...\n");
    
    // Test 1: List all records
    console.log("1. Listing all records:");
    try {
      const res = await axios.get(`${API_BASE}/records`);
      console.log(`   ✓ Found ${res.data.length} records`);
      if (res.data.length > 0) {
        console.log(`   First record patient ID: ${res.data[0].patientId}`);
      }
    } catch (err) {
      console.log(`   ✗ Error: ${err.response?.status} - ${err.response?.statusText}`);
    }
    
    // Test 2: Try to access category endpoint
    console.log("\n2. Testing /records/category-history/profile endpoint:");
    try {
      const res = await axios.get(`${API_BASE}/records/category-history/profile?patientId=PAT-2026-9890`);
      console.log(`   ✓ Status: ${res.status}`);
      console.log(`   Response:`, res.data);
    } catch (err) {
      console.log(`   ✗ Status: ${err.response?.status} - ${err.response?.statusText}`);
      console.log(`   URL called: ${err.config?.url}`);
      if (err.response?.data) {
        console.log(`   Error message: ${err.response.data.message || JSON.stringify(err.response.data)}`);
      }
    }
    
    // Test 3: Try to access the endpoint without query params
    console.log("\n3. Testing /records/category-history/profile without params:");
    try {
      const res = await axios.get(`${API_BASE}/records/category-history/profile`);
      console.log(`   ✓ Status: ${res.status}`);
    } catch (err) {
      console.log(`   ✗ Status: ${err.response?.status} - ${err.response?.statusText}`);
      if (err.response?.data) {
        console.log(`   Error message: ${err.response.data.message || JSON.stringify(err.response.data)}`);
      }
    }
    
    // Test 4: Try accessing with a patient ID as path param (old way)
    console.log("\n4. Testing /records/PAT-2026-9890 (path param):");
    try {
      const res = await axios.get(`${API_BASE}/records/PAT-2026-9890`);
      console.log(`   ✓ Status: ${res.status}`);
      console.log(`   Patient ID: ${res.data.patientId}`);
    } catch (err) {
      console.log(`   ✗ Status: ${err.response?.status}`);
    }
    
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

testCategoryEndpoint();
