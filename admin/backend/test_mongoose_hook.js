const mongoose = require('mongoose');
const Patient = require('./models/patient');
const connectDB = require('./config/db');

async function test() {
    await connectDB();
    console.log('Connected to DB');

    const patientData = {
        name: 'Test Patient Hook',
        category: 'Pediatric',
        pediatricData: {
            immunizationStatus: ''
        }
    };

    try {
        const patient = new Patient(patientData);
        console.log('Validating...');
        await patient.validate();
        console.log('Validation successful');
    } catch (err) {
        console.error('Validation failed:', err.message);
        console.error('Error stack:', err.stack);
    } finally {
        await mongoose.disconnect();
    }
}

test();
