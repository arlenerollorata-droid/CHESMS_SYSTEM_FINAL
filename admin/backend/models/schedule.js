const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'patientModel',
    required: true
  },
  patientModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Resident'],
    default: 'Patient'
  },
  patientName: String, 
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  scheduleType: {
    type: String,
    default: 'Scheduled Appointment'
  },
  service: {
    type: String, 
    required: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  },
  location: {
    type: String,
    enum: ['Health Center', 'Barangay Hall', 'Home Visit', 'Satellite Clinic', 'School'],
    default: 'Health Center'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'No-show', 'Cancelled'],
    default: 'Pending'
  },
  notes: String,
  focus: String
}, { timestamps: true });

// Unique compound index to prevent duplicate appointments
ScheduleSchema.index({ patient: 1, date: 1, time: 1 }, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'Cancelled' } }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
