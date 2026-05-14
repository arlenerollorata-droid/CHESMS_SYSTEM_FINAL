const Resident = require("../models/resident");

exports.getResidents = async (req, res) => {
    try {
        const residents = await Resident.find().sort({ createdAt: -1 });
        res.json(residents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addResident = async (req, res) => {
    try {
        const errors = [];
        if (!req.body.firstName || req.body.firstName.trim() === "") {
            errors.push("First name is required");
        }
        if (!req.body.lastName || req.body.lastName.trim() === "") {
            errors.push("Last name is required");
        }
        if (!req.body.birthdate) {
            errors.push("Birthdate is required");
        }
        if (!req.body.purok || req.body.purok.trim() === "") {
            errors.push("Purok is required");
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(", ") });
        }

        // Check for duplicates
        const existing = await Resident.findOne({
            firstName: { $regex: new RegExp(`^${req.body.firstName.trim()}$`, "i") },
            lastName: { $regex: new RegExp(`^${req.body.lastName.trim()}$`, "i") },
            birthdate: req.body.birthdate
        });

        if (existing) {
            return res.status(400).json({ message: "A resident with this name and birthdate already exists in the system" });
        }

        const newResident = new Resident(req.body);
        await newResident.save();
        res.status(201).json(newResident);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateResident = async (req, res) => {
    try {
        const existing = await Resident.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Resident not found" });
        }
        const updated = await Resident.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteResident = async (req, res) => {
    try {
        const existing = await Resident.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Resident not found" });
        }
        await Resident.findByIdAndDelete(req.params.id);
        res.json({ message: "Resident removed from census" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};