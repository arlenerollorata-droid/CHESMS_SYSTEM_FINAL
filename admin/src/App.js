import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Schedule from "./pages/Schedule";
import Residents from "./pages/Residents";
import Attendance from "./pages/Attendance";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Census from "./pages/Census";
import Notifications from "./pages/Notifications";
import MedicalHistoryPage from "./pages/MedicalHistoryPage";

// Professional Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Secure Private Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/residents" element={<ProtectedRoute><Residents /></ProtectedRoute>} />
        <Route path="/census" element={<ProtectedRoute><Census /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/medical-history" element={<ProtectedRoute><MedicalHistoryPage /></ProtectedRoute>} />
        <Route path="/medical-history/:patientId" element={<ProtectedRoute><MedicalHistoryPage /></ProtectedRoute>} />

        {/* Fallback to Dashboard/Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
