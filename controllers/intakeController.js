const IntakeLog = require("../models/intake");
const Medication = require("../models/medication");

const addLog = async (req, res) => {
  try {
    const { medicationId, date, time, status, mood, note } = req.body;
    const existing = await IntakeLog.findOne({
      userId: req.user._id,
      medicationId,
      date,
      time,
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Already logged for this time slot" });
    }

    const log = await IntakeLog.create({
      userId: req.user._id,
      medicationId,
      date,
      time,
      status,
      note,
    });

    if (status === "taken") {
      const med = await Medication.findOne({
        _id: medicationId,
        userId: req.user._id,
      });

      if (med && med.stock > 0) {
        med.stock -= 1;
        await med.save();
      }
    }

    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getLogs = async (req, res) => {
  try {
    const { date } = req.query;

    const meds = await Medication.find({ userId: req.user._id });
    const logs = await IntakeLog.find({ userId: req.user._id }).lean();

    const selectedDate = date ? new Date(date) : new Date();

    let dailyLogs = [];

    meds.forEach((med) => {
      const start = new Date(med.startDate);
      const end = new Date(med.endDate);

      if (selectedDate >= start && selectedDate <= end) {
        med.timeSlots.forEach((slot) => {
          const existing = logs.find(
            (l) =>
              l.medicationId.toString() === med._id.toString() &&
              new Date(l.date).toDateString() === selectedDate.toDateString() &&
              l.time === slot
          );

          dailyLogs.push({
            date: selectedDate,
            time: slot,
            medicationId: med._id,
            medicationName: med.name,
            status: existing ? existing.status : null,
            note: existing ? existing.note : null,
          });
        });
      }
    });

    res.json({ success: true, dailyLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getTodayLog = async (req, res) => {
  try {
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const intakes = await IntakeLog.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    }).populate("medicationId", "name");

    if (intakes.length === 0) {
      const meds = await Medication.find({
        userId,
        startDate: { $lte: today },
        $or: [{ endDate: null }, { endDate: { $gte: today } }],
      });

      const reminders = meds.flatMap((m) =>
        m.timeSlots.map((t) => ({
          medicationName: m.name,
          time: t,
          status: "pending",
        }))
      );

      return res.json({ success: true, reminders });
    }

    const reminders = intakes.map((i) => ({
      medicationName: i.medicationId.name,
      time: i.time,
      status: i.status,
    }));

    res.json({ success: true, reminders });
  } catch (err) {
    console.error("Error fetching today's reminders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addLog,
  getLogs,
  getTodayLog,
};
