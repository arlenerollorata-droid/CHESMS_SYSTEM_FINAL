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
  status: { type: String, enum: ["Upcoming", "Today", "Past"], default: "Upcoming" },
  note: String,
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
