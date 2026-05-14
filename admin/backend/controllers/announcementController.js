const Announcement = require("../models/announcement");

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addAnnouncement = async (req, res) => {
    try {
        const newAnnouncement = new Announcement(req.body);
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const existing = await Announcement.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};