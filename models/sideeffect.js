const mongoose = require("mongoose");

const sideEffectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    symptoms: [String],
    severity: { type: Number, min: 1, max: 5 },
    notes: String,
  },
  { timestamps: true }
);

const SideEffect = mongoose.model("SideEffect", sideEffectSchema);
module.exports = SideEffect;
