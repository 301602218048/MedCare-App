const mongoose = require("mongoose");

const intakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["taken", "missed"], required: true },
    note: String,
  },
  { timestamps: true }
);

const Intake = mongoose.model("Intake", intakeSchema);
module.exports = Intake;
