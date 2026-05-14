// Import modules
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import models (register them with mongoose)
require("./models/admin");
require("./models/patient");
require("./models/resident");
require("./models/appointment");
require("./models/attendance");
require("./models/event");
require("./models/schedule");
require("./models/record");
require("./models/announcement");

// Import routes
const authRoutes = require("./routes/authRoutes");
const mobileAuthRoutes = require("./routes/mobileAuthRoutes");
const patientRoutes = require("./routes/patientRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const residentRoutes = require("./routes/residentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const recordRoutes = require("./routes/recordRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

// Initialize app (MUST come before using app)
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mobile-auth", mobileAuthRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/appointments", appointmentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Barangay Health API Running");
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected to 'CHESMS_System'");
    
    // Create default admin user
    const authController = require("./controllers/authController");
    await authController.createDefaultAdmin();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
