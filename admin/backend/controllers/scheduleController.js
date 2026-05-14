const Schedule = require("../models/schedule");

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // Validate date is not in the past
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates' });
    }
    
    // Validate 5:00 PM cutoff for today
    const isToday = selectedDate.getTime() === today.getTime();
    if (isToday && time) {
      const timeToMinutes = (timeStr) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const selectedMinutes = timeToMinutes(time);
      const fivePMMinutes = 17 * 60;
      
      if (selectedMinutes >= fivePMMinutes) {
        return res.status(400).json({ message: 'Cannot book appointments after 5:00 PM - clinic hours have ended' });
      }
    }
    
    const newSchedule = new Schedule(req.body);
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSchedulesByPatient = async (req, res) => {
  try {
    const schedules = await Schedule.find({ patient: req.params.patientId }).sort({ date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // Validate date is not in the past
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates' });
    }
    
    // Validate 5:00 PM cutoff for today
    const isToday = selectedDate.getTime() === today.getTime();
    if (isToday && time) {
      const timeToMinutes = (timeStr) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const selectedMinutes = timeToMinutes(time);
      const fivePMMinutes = 17 * 60;
      
      if (selectedMinutes >= fivePMMinutes) {
        return res.status(400).json({ message: 'Cannot book appointments after 5:00 PM - clinic hours have ended' });
      }
    }
    
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
