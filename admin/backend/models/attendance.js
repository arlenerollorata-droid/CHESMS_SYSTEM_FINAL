const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
