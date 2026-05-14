const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    date: { type: Date, required: true },
    time: String,
    type: { type: String, enum: ['Checkup', 'Follow-up', 'Emergency', 'Consultation'], default: 'Checkup' },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
    notes: String,
    createdBy: String
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);