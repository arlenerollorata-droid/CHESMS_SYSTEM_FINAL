const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Username and password are required" 
        });
      }

      const admin = await Admin.findOne({ username });

      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }

      res.json({
        success: true,
        message: "Login successful",
        admin: {
          id: admin._id,
          username: admin.username,
          fullName: admin.fullName,
          email: admin.email,
          position: admin.position,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error" 
      });
    }
  },

  async getProfile(req, res) {
    try {
      const adminId = req.headers['admin-id'];
      
      if (!adminId) {
        return res.status(400).json({ 
          success: false,
          message: "Please login again" 
        });
      }

      // Check if adminId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid session. Please login again." 
        });
      }

      const admin = await Admin.findById(adminId).select("-password");

      if (!admin) {
        return res.status(404).json({ 
          success: false,
          message: "Admin not found. Please login again." 
        });
      }

      res.json({
        success: true,
        admin
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error. Please try again." 
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const adminId = req.headers['admin-id'];
      const { fullName, email, position } = req.body;

      if (!adminId) {
        return res.status(400).json({ 
          success: false,
          message: "Please login again" 
        });
      }

      // Check if adminId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid session. Please login again." 
        });
      }

      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { fullName, email, position },
        { new: true, runValidators: true }
      ).select("-password");

      if (!admin) {
        return res.status(404).json({ 
          success: false,
          message: "Admin not found. Please login again." 
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        admin
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error. Please try again." 
      });
    }
  },

  async changePassword(req, res) {
    try {
      console.log("=== Change Password Request ===");
      const adminId = req.headers['admin-id'];
      const { currentPassword, newPassword } = req.body;
      
      console.log("Admin ID from header:", adminId);
      console.log("Current password provided:", currentPassword ? "Yes" : "No");
      console.log("New password provided:", newPassword ? "Yes" : "No");

      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        console.log("Invalid admin ID");
        return res.status(400).json({ 
          success: false,
          message: "Invalid session. Please login again." 
        });
      }

      if (!currentPassword || !newPassword) {
        console.log("Missing passwords");
        return res.status(400).json({ 
          success: false,
          message: "Current and new password are required" 
        });
      }

      if (newPassword.length < 8) {
        console.log("Password too short");
        return res.status(400).json({ 
          success: false,
          message: "Password must be at least 8 characters" 
        });
      }

      console.log("Finding admin...");
      const admin = await Admin.findById(adminId);
      console.log("Admin found:", admin ? "Yes" : "No");
      
      if (!admin) {
        console.log("Admin not found in DB");
        return res.status(404).json({ 
          success: false,
          message: "Admin not found. Please login again." 
        });
      }

      console.log("Comparing passwords...");
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        console.log("Password incorrect");
        return res.status(400).json({ 
          success: false,
          message: "Current password is incorrect" 
        });
      }

      console.log("Hashing new password...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      console.log("Password hashed");

      console.log("Updating password in DB...");
      await Admin.findByIdAndUpdate(adminId, { password: hashedPassword });
      console.log("Password updated");

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("Change password error:", error.message);
      console.error(error.stack);
      res.status(500).json({ 
        success: false,
        message: "Server error. Please try again." 
      });
    }
  },

  async createDefaultAdmin() {
    try {
      const existingAdmin = await Admin.findOne({ username: "admin" });
      
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        await Admin.create({
          username: "admin",
          password: hashedPassword,
          fullName: "Super Administrator",
          email: "admin@chesms.gov.ph",
          position: "System Administrator",
          role: "admin"
        });
        
        console.log("Default admin created: admin / admin123");
      }
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  }
};

module.exports = authController;
