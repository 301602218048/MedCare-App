const SideEffect = require("../models/sideeffect");

const add = async (req, res) => {
  try {
    const { date, symptoms, severity, notes } = req.body;
    await SideEffect.create({
      userId: req.user._id,
      date,
      symptoms,
      severity,
      notes,
    });
    res.json({ success: true, message: "Side effect logged successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error saving side effect",
      error: err.message,
    });
  }
};

const list = async (req, res) => {
  try {
    const sideEffects = await SideEffect.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.json({ success: true, sideEffects });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching side effects",
      error: err.message,
    });
  }
};

module.exports = {
  add,
  list,
};
