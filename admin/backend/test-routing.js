const express = require("express");
const axios = require("axios");

// Create a simple test server to understand the routing
const app = express();
const router = express.Router();

// Define a handler
router.get("/category-history/profile", (req, res) => {
  res.json({ message: "Category route works!" });
});

router.get("/:patientId", (req, res) => {
  res.json({ message: "Patient route works", patientId: req.params.patientId });
});

// Mount the router
app.use("/records", router);

// Start test server
const testServer = app.listen(5001, () => {
  console.log("Test server running on port 5001\n");
  
  // Run tests
  setTimeout(async () => {
    try {
      console.log("Test 1: /records/category-history/profile");
      const res1 = await axios.get("http://localhost:5001/records/category-history/profile");
      console.log(`✓ Response: ${res1.data.message}`);
    } catch (err) {
      console.log(`✗ Error: ${err.response?.status} - ${err.response?.data?.message}`);
    }
    
    try {
      console.log("\nTest 2: /records/some-patient-id");
      const res2 = await axios.get("http://localhost:5001/records/some-patient-id");
      console.log(`✓ Response: ${res2.data.message}`);
    } catch (err) {
      console.log(`✗ Error: ${err.response?.status}`);
    }
    
    testServer.close();
    process.exit(0);
  }, 500);
});
