const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  target: { type: String, default: 'All Residents' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  isPinned: { type: Boolean, default: false },
  author: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
