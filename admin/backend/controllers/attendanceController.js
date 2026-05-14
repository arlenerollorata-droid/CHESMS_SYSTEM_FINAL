const Attendance = require("../models/attendance");

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find().sort({ createdAt: -1 });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const newRecord = new Attendance(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const existing = await Attendance.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        const updatedRecord = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const existing = await Attendance.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: "Attendance record deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};