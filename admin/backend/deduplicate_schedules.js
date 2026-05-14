// Run: node deduplicate_schedules.js
// Connects to MongoDB and removes duplicate schedule/appointment documents

const mongoose = require("mongoose");
const connectDB = require("./config/db");

require("./models/schedule");
require("./models/appointment");

const Schedule = mongoose.model("Schedule");
const Appointment = mongoose.model("Appointment");

async function deduplicateCollection(Model, name, groupFields) {
  console.log(`\n--- Checking ${name} for duplicates ---`);

  const pipeline = [
    {
      $group: {
        _id: groupFields,
        docs: { $push: { _id: "$_id", createdAt: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ];

  const duplicates = await Model.aggregate(pipeline);

  if (duplicates.length === 0) {
    console.log(`No duplicates found in ${name}.`);
    return 0;
  }

  let removed = 0;
  for (const group of duplicates) {
    // Sort by createdAt ascending, keep first (oldest)
    const sorted = group.docs.sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
    const keep = sorted[0];
    const toRemove = sorted.slice(1).map(d => d._id);

    await Model.deleteMany({ _id: { $in: toRemove } });
    removed += toRemove.length;

    const keyStr = Object.values(group._id).join(" | ");
    console.log(`  Kept ${keep._id}, removed ${toRemove.length} duplicate(s) for: ${keyStr}`);
  }

  console.log(`Total ${name} duplicates removed: ${removed}`);
  return removed;
}

async function run() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Deduplicate schedules: same patient + date + time, excluding Cancelled
    const schedRemoved = await deduplicateCollection(
      Schedule,
      "schedules",
      { patient: "$patient", date: "$date", time: "$time" }
    );

    // Deduplicate appointments: same patientName + date + type
    const apptRemoved = await deduplicateCollection(
      Appointment,
      "appointments",
      { patientName: "$patientName", date: "$date", type: "$type" }
    );

    console.log("\n--- Cleanup Complete ---");
    console.log(`Schedules removed: ${schedRemoved}`);
    console.log(`Appointments removed: ${apptRemoved}`);
    console.log(`Total removed: ${schedRemoved + apptRemoved}`);
  } catch (err) {
    console.error("Deduplication error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run();
