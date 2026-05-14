const Appointment = require("../models/appointment");

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addAppointment = async (req, res) => {
    try {
        const errors = [];
        if (!req.body.patientName) {
            errors.push("Patient name is required");
        }
        if (!req.body.date) {
            errors.push("Appointment date is required");
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(", ") });
        }

        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const existing = await Appointment.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const existing = await Appointment.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Appointment deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};