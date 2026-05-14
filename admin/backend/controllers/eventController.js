const Event = require("../models/event");

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addEvent = async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const existing = await Event.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Event not found" });
        }
        const updated = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const existing = await Event.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Event not found" });
        }
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const registrationData = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.capacityTotal > 0 && event.capacityTaken >= event.capacityTotal) {
            return res.status(400).json({ message: "Event is already at full capacity" });
        }

        event.registrations.push(registrationData);
        event.capacityTaken += 1;
        await event.save();

        res.status(200).json({ message: "Registered successfully", event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};