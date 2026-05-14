const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const Patient = require("./models/patient");
const Resident = require("./models/resident");
const Schedule = require("./models/schedule");
const Event = require("./models/event");
const MedicalRecord = require("./models/record");
const Announcement = require("./models/announcement");
const Attendance = require("./models/attendance");

const connectDB = require("./config/db");

const seedDatabase = async () => {
  await connectDB();

  console.log("Clearing old data...");
  try { await Patient.deleteMany({}); } catch(e) {}
  try { await mongoose.connection.collection('residents').drop(); } catch(e) {}
  try { await Schedule.deleteMany({}); } catch(e) {}
  try { await Event.deleteMany({}); } catch(e) {}
  try { await MedicalRecord.deleteMany({}); } catch(e) {}
  try { await Announcement.deleteMany({}); } catch(e) {}
  try { await Attendance.deleteMany({}); } catch(e) {}

  console.log("Seeding data...");

  // 1. Announcements
  await Announcement.insertMany([
    { title: "Measles Outbreak Alert", content: "Please be advised of the recent increase in measles cases in nearby barangays.", category: "Health Alert", priority: "High", author: "Admin Setup" },
    { title: "Monthly Free Clinic", content: "Free checkups and vitamins distribution this Saturday at the center.", category: "Event", priority: "Medium", author: "Maria Clara" },
    { title: "System Maintenance", content: "CHESMS will undergo maintenance on Sunday at 2 AM.", category: "General", priority: "Low", author: "Admin Setup" }
  ]);

  // 2. Medical Records (from mock data)
  await MedicalRecord.insertMany([
    {
      patientId: 'PT-001',
      patientName: 'Maria Reyes',
      patientAvatar: 'MR',
      age: 35,
      sex: 'Female',
      bloodType: 'O+',
      address: 'Blk 5 Lot 3 Sampaguita St., Barangay Uno, Quezon City',
      contact: '09171234567',
      category: 'OPD',
      lastVisit: '2026-04-07',
      knownConditions: 'Hypertension',
      allergies: 'None known',
      consultations: [
        {
          id: 'CON-001',
          date: '2026-04-07',
          chiefComplaint: 'Headache and dizziness',
          diagnosis: 'Hypertension — poorly controlled',
          treatment: 'Adjusted medication dosage. Advised low-salt diet and rest.',
          notes: 'Return in 2 weeks for BP monitoring.',
          bloodPressure: '150/95 mmHg',
          temperature: '36.8°C',
          weight: '68 kg'
        },
        {
          id: 'CON-002',
          date: '2026-03-10',
          chiefComplaint: 'Routine blood pressure check',
          diagnosis: 'Hypertension — stable',
          treatment: 'Continue current medication.',
          notes: 'Patient advised to monitor BP at home daily.',
          bloodPressure: '140/90 mmHg',
          temperature: '36.5°C',
          weight: '67 kg'
        }
      ],
      prescriptions: [
        { id: 'PRE-001', medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once a day', duration: '30 days', datePrescribed: '2026-04-07', notes: 'Take in the morning' },
        { id: 'PRE-002', medicine: 'Losartan', dosage: '50mg', frequency: 'Once a day', duration: '30 days', datePrescribed: '2026-03-10', notes: '' }
      ],
      labResults: [
        { id: 'LAB-001', testName: 'Complete Blood Count', result: 'Normal', normalRange: 'See attached report', dateOfTest: '2026-03-10', remarks: 'Normal', notes: '' },
        { id: 'LAB-002', testName: 'Lipid Profile', result: 'LDL: 3.8 mmol/L', normalRange: 'Below 3.4 mmol/L', dateOfTest: '2026-03-10', remarks: 'Abnormal', notes: 'Advised low-fat diet' }
      ],
      immunizations: [
        { id: 'IMM-001', vaccineName: 'Influenza', dateGiven: '2026-01-15', nextDueDate: '2027-01-15', notes: '' }
      ],
      referrals: []
    },
    {
      patientId: 'PT-002',
      patientName: 'Cynthia Dela Cruz',
      patientAvatar: 'CD',
      age: 28,
      sex: 'Female',
      bloodType: 'A+',
      address: 'Unit 3B Rosario Apartments, Barangay Dos, Quezon City',
      contact: '09182345678',
      category: 'Prenatal',
      lastVisit: '2026-04-07',
      knownConditions: 'None',
      allergies: 'Penicillin',
      consultations: [
        {
          id: 'CON-003',
          date: '2026-04-07',
          chiefComplaint: 'Routine prenatal checkup — 7 months',
          diagnosis: 'Normal pregnancy, 28 weeks AOG',
          treatment: 'Continue prenatal vitamins. Advised adequate rest.',
          notes: 'Baby heartbeat normal at 140 bpm. Next check in 4 weeks.',
          bloodPressure: '110/70 mmHg',
          temperature: '36.6°C',
          weight: '72 kg'
        }
      ],
      prescriptions: [
        { id: 'PRE-003', medicine: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Twice a day', duration: '60 days', datePrescribed: '2026-04-07', notes: 'Take after meals' },
        { id: 'PRE-004', medicine: 'Folic Acid', dosage: '5mg', frequency: 'Once a day', duration: '60 days', datePrescribed: '2026-04-07', notes: '' }
      ],
      labResults: [
        { id: 'LAB-003', testName: 'Urinalysis', result: 'Normal', normalRange: 'Normal', dateOfTest: '2026-04-07', remarks: 'Normal', notes: '' },
        { id: 'LAB-004', testName: 'Blood Sugar (RBS)', result: '5.1 mmol/L', normalRange: '3.9–7.8 mmol/L', dateOfTest: '2026-04-07', remarks: 'Normal', notes: '' }
      ],
      immunizations: [
        { id: 'IMM-002', vaccineName: 'Tetanus Toxoid', dateGiven: '2026-02-10', nextDueDate: '2026-06-10', notes: 'Second dose' }
      ],
      referrals: [
        { id: 'REF-001', referredTo: 'Quirino Memorial Medical Center', reason: 'Ultrasound — Level 2', date: '2026-04-07', status: 'Pending' }
      ]
    },
    {
      patientId: 'PT-003',
      patientName: 'Miguel Lim',
      patientAvatar: 'ML',
      age: 4,
      sex: 'Male',
      bloodType: 'B+',
      address: '45 Maligaya St., Barangay Tres, Quezon City',
      contact: '09193456789',
      category: 'Pediatric',
      lastVisit: '2026-04-07',
      knownConditions: 'None',
      allergies: 'None known',
      consultations: [
        {
          id: 'CON-004',
          date: '2026-04-07',
          chiefComplaint: 'Fever and cough for 2 days',
          diagnosis: 'Upper Respiratory Tract Infection (URTI)',
          treatment: 'Paracetamol for fever. Steam inhalation. Increase fluids.',
          notes: 'Return if fever exceeds 39°C or lasts more than 3 days.',
          bloodPressure: 'N/A',
          temperature: '38.1°C',
          weight: '16 kg'
        }
      ],
      prescriptions: [
        { id: 'PRE-005', medicine: 'Paracetamol Syrup', dosage: '250mg/5ml', frequency: 'Every 6 hours', duration: '3 days', datePrescribed: '2026-04-07', notes: 'Give only when with fever' }
      ],
      labResults: [],
      immunizations: [
        { id: 'IMM-003', vaccineName: 'MMR', dateGiven: '2026-04-06', nextDueDate: '', notes: 'First dose completed' },
        { id: 'IMM-004', vaccineName: 'Hepatitis B', dateGiven: '2023-03-01', nextDueDate: '', notes: 'Complete series' },
        { id: 'IMM-005', vaccineName: 'BCG', dateGiven: '2022-01-10', nextDueDate: '', notes: 'Given at birth' }
      ],
      referrals: []
    },
    {
      patientId: 'PT-004',
      patientName: 'Roberto Cruz',
      patientAvatar: 'RC',
      age: 45,
      sex: 'Male',
      bloodType: 'O-',
      address: '12 Mabuhay Ave., Barangay Apat, Quezon City',
      contact: '09204567890',
      category: 'OPD',
      lastVisit: '2026-04-07',
      knownConditions: 'Diabetes Type 2',
      allergies: 'Sulfa drugs',
      consultations: [
        {
          id: 'CON-005',
          date: '2026-04-07',
          chiefComplaint: 'Severe abdominal pain',
          diagnosis: 'Acute Gastroenteritis',
          treatment: 'IV fluids. Oral rehydration. Antispasmodic medication.',
          notes: 'Monitored for 2 hours. Condition improved. Advised soft diet.',
          bloodPressure: '125/82 mmHg',
          temperature: '37.9°C',
          weight: '82 kg'
        }
      ],
      prescriptions: [
        { id: 'PRE-006', medicine: 'Metformin', dosage: '500mg', frequency: 'Twice a day', duration: '30 days', datePrescribed: '2026-03-01', notes: 'Take with meals' },
        { id: 'PRE-007', medicine: 'Hyoscine Butylbromide', dosage: '10mg', frequency: 'Every 8 hours', duration: '3 days', datePrescribed: '2026-04-07', notes: 'For abdominal pain' }
      ],
      labResults: [
        { id: 'LAB-005', testName: 'Fasting Blood Sugar', result: '8.2 mmol/L', normalRange: '3.9–6.1 mmol/L', dateOfTest: '2026-03-01', remarks: 'Abnormal', notes: 'Diabetes not well controlled' },
        { id: 'LAB-006', testName: 'HbA1c', result: '7.8%', normalRange: 'Below 7%', dateOfTest: '2026-03-01', remarks: 'Abnormal', notes: 'Adjust medication and diet' }
      ],
      immunizations: [
        { id: 'IMM-006', vaccineName: 'Influenza', dateGiven: '2026-01-20', nextDueDate: '2027-01-20', notes: '' }
      ],
      referrals: []
    },
    {
      patientId: 'PT-005',
      patientName: 'Luisa Marcos',
      patientAvatar: 'LM',
      age: 62,
      sex: 'Female',
      bloodType: 'AB+',
      address: '88 Kalayaan St., Barangay Lima, Quezon City',
      contact: '09215678901',
      category: 'Senior',
      lastVisit: '2026-04-01',
      knownConditions: 'Diabetes Type 2, Hypertension',
      allergies: 'Aspirin',
      consultations: [
        {
          id: 'CON-006',
          date: '2026-04-01',
          chiefComplaint: 'Monthly diabetes and BP monitoring',
          diagnosis: 'Diabetes Type 2 — controlled. Hypertension — stable.',
          treatment: 'Continue current medications. Advised daily walking.',
          notes: 'Next visit in 4 weeks.',
          bloodPressure: '135/85 mmHg',
          temperature: '36.4°C',
          weight: '71 kg'
        }
      ],
      prescriptions: [
        { id: 'PRE-008', medicine: 'Glibenclamide', dosage: '5mg', frequency: 'Once a day', duration: '30 days', datePrescribed: '2026-04-01', notes: 'Take before breakfast' },
        { id: 'PRE-009', medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once a day', duration: '30 days', datePrescribed: '2026-04-01', notes: '' }
      ],
      labResults: [
        { id: 'LAB-007', testName: 'Blood Sugar (FBS)', result: '6.4 mmol/L', normalRange: '3.9–6.1 mmol/L', dateOfTest: '2026-04-01', remarks: 'Abnormal', notes: 'Slightly elevated — monitor' }
      ],
      immunizations: [
        { id: 'IMM-007', vaccineName: 'Pneumococcal', dateGiven: '2025-11-10', nextDueDate: '', notes: 'Given for senior patient' },
        { id: 'IMM-008', vaccineName: 'Influenza', dateGiven: '2026-01-05', nextDueDate: '2027-01-05', notes: '' }
      ],
      referrals: []
    }
  ]);

  // 3. Patients (Detailed data for enhanced schema)
  const patientData = [];
  const ages = [5, 8, 10, 11, 14, 16, 17, 18, 25, 30, 35, 40, 45, 50, 62, 65, 70, 75, 80, 85];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-', 'Unknown'];
  const civilStatuses = ['Single', 'Married', 'Widowed', 'Separated'];
  const conditions = ['Asthma', 'Hypertension', 'Diabetes', 'Allergies', 'None', 'Heart Disease'];
  
  for (let i = 0; i < ages.length; i++) {
    const gender = i % 2 === 0 ? "Male" : "Female";
    const bType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const cStatus = ages[i] > 20 ? civilStatuses[Math.floor(Math.random() * civilStatuses.length)] : 'Single';
    const medicalHistory = ages[i] > 40 
      ? [{ condition: conditions[1], status: 'Ongoing' }, { condition: conditions[2], status: 'Ongoing' }]
      : [{ condition: conditions[Math.floor(Math.random() * conditions.length)], status: 'Active' }];

    patientData.push({
      patientId: `PAT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      name: `Patient ${i + 1}`,
      age: ages[i],
      gender: gender,
      civilStatus: cStatus,
      bloodType: bType,
      address: `Purok ${Math.floor(Math.random() * 5) + 1}, Barangay Health`,
      contact: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
      emergencyContact: {
        name: `Emergency Contact ${i + 1}`,
        relation: i % 2 === 0 ? 'Parent' : 'Spouse',
        phone: `09${Math.floor(100000000 + Math.random() * 900000000)}`
      },
      medicalHistory: medicalHistory,
      status: i % 10 === 0 ? 'Inactive' : 'Active'
    });
  }
  await Patient.insertMany(patientData);

  // 4. Residents
  const residentData = [];
  const firstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lisa', 'Jose', 'Rosa', 'Miguel', 'Sofia'];
  const lastNames = ['Santos', 'Cruz', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Villar', 'Aquino', 'Bautista'];
  
  for (let i = 0; i < 45; i++) {
    const birthYear = 1950 + Math.floor(Math.random() * 60);
    residentData.push({
      residentId: `RES-2026-${(i + 1).toString().padStart(4, '0')}`,
      firstName: firstNames[i % firstNames.length],
      middleName: 'D.',
      lastName: lastNames[i % lastNames.length],
      gender: i % 2 === 0 ? 'Male' : 'Female',
      birthdate: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      age: 2026 - birthYear,
      civilStatus: i > 25 ? 'Married' : 'Single',
      contactNumber: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
      purok: `${(i % 5) + 1}`,
      barangay: 'Health',
      municipality: 'Quezon City',
      province: 'Metro Manila',
      status: 'Active'
    });
  }
  await Resident.insertMany(residentData);

  // 5. Events
  const now = new Date();
  const todayStr = new Date().toDateString();
  const nextWeekStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toDateString();
  const tomorrowStr = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toDateString();
  const lastWeekStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toDateString();

  await Event.insertMany([
    { title: "Barangay Cleanup Drive", description: "General community cleanup.", date: tomorrowStr, startTime: "08:00 AM", endTime: "12:00 PM", location: "Barangay Hall", capacityTotal: 100, capacityTaken: 45, category: "General", status: "Upcoming" },
    { title: "Free Vaccination Day", description: "For children 0-5 years old.", date: nextWeekStr, startTime: "09:00 AM", endTime: "03:00 PM", location: "Health Center", capacityTotal: 50, capacityTaken: 20, category: "General", status: "Upcoming" },
    { title: "Senior Citizens Assembly", description: "Monthly assembly and checkup.", date: todayStr, startTime: "01:00 PM", endTime: "04:00 PM", location: "Covered Court", capacityTotal: 80, capacityTaken: 80, category: "General", status: "Today" },
    { title: "Nutrition Month Seminar", description: "Health teaching.", date: lastWeekStr, startTime: "10:00 AM", endTime: "12:00 PM", location: "Health Center", capacityTotal: 30, capacityTaken: 25, category: "General", status: "Past" },
  ]);

  // 6. Schedules (Appointments)
  const scheduleData = [];
  const scheduleTypes = ['Prenatal', 'Immunization', 'Special Case', 'Routine', 'NCD (Hypertension/Diabetes)'];
  const services = ['Prenatal Check-up', 'Vaccine', 'Follow-up', 'BP Monitoring', 'Dental'];
  const statuses = ['Pending', 'Confirmed', 'Cancelled'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + Math.floor(Math.random() * 30) - 10);
    
    scheduleData.push({
      patient: (await Patient.find().skip(i % 20).limit(1))[0]?._id || null,
      patientModel: 'Patient',
      patientName: `Patient ${(i % 20) + 1}`,
      date: date,
      scheduleType: scheduleTypes[i % scheduleTypes.length],
      service: services[i % services.length],
      urgency: i % 3 === 0 ? 'Urgent' : 'Normal',
      location: 'Health Center',
      assignedStaff: i % 2 === 0 ? 'Midwife Maria' : 'Nurse Juan',
      doseNumber: Math.floor(Math.random() * 3) + 1,
      status: statuses[i % statuses.length],
      notes: 'Regular scheduled visit.'
    });
  }
  await Schedule.insertMany(scheduleData);

  // 7. Attendance (Patient Attendance at Events)
  const allPatients = await Patient.find();
  const allEvents = await Event.find();
  
  if (allPatients.length > 0 && allEvents.length > 0) {
    const attendanceData = [];
    const statuses = ['Present', 'Absent'];
    const remarks = ['Patient arrived on time', 'Patient was late', 'No show', 'Rescheduled'];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - Math.floor(Math.random() * 14));
      
      attendanceData.push({
        patient: allPatients[i % allPatients.length]._id,
        event: allEvents[i % allEvents.length]._id,
        date: date,
        status: statuses[i % statuses.length],
        remarks: remarks[i % remarks.length]
      });
    }
    await Attendance.insertMany(attendanceData);
  }

  console.log("Database seeded successfully!");
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
