const Intake = require("../models/intake");
const Medication = require("../models/medication");
const SideEffect = require("../models/sideeffect");

const analytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const intakes = await Intake.find({ userId });
    const taken = intakes.filter((i) => i.status === "taken").length;
    const missed = intakes.filter((i) => i.status === "missed").length;

    const dates = [];
    const takenCounts = [];
    const missedCounts = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const label = day.toLocaleDateString();
      dates.push(label);

      const daily = intakes.filter(
        (i) => new Date(i.date).toDateString() === day.toDateString()
      );
      takenCounts.push(daily.filter((d) => d.status === "taken").length);
      missedCounts.push(daily.filter((d) => d.status === "missed").length);
    }

    const sideEffects = await SideEffect.find({ userId });
    const severityCounts = [0, 0, 0, 0, 0];
    sideEffects.forEach((se) => severityCounts[se.severity - 1]++);

    const totalMeds = await Medication.countDocuments({ userId });
    const summary = {
      totalMeds,
      totalIntakes: intakes.length,
      adherenceRate: intakes.length
        ? Math.round((taken / intakes.length) * 100)
        : 0,
      totalSideEffects: sideEffects.length,
    };

    res.json({
      success: true,
      adherence: { taken, missed },
      intakeTrend: { dates, takenCounts, missedCounts },
      sideEffects: severityCounts,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error generating report" });
  }
};

module.exports = { analytics };
