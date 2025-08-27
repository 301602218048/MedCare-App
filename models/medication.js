const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    dosage: String,
    timeSlots: [String],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    stock: { type: Number, default: 0 },
    refillThreshold: { type: Number, default: 2 },
    prescriptionFile: {
      type: String,
    },
  },
  { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);
module.exports = Medication;
