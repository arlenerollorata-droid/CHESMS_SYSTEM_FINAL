const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Health Alert', 'Event', 'General'], default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  author: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
