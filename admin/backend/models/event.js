const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true },
  startTime: String,
  endTime: String,
  location: String,
  capacityTotal: { type: Number, default: 0 },
  capacityTaken: { type: Number, default: 0 },
  category: { type: String, default: "General" },
  target: { type: String, default: "All Residents" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Upcoming", "Today", "Past"], default: "Upcoming" },
  isPinned: { type: Boolean, default: false },
  author: String,
  note: String,
  registrations: [{
    fullName: String,
    age: Number,
    mobileNumber: String,
    medicalCondition: String,
    allergies: String,
    contactPerson: String,
    contactNumber: String,
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
    registeredAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
