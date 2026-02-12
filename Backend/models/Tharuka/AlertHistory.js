const mongoose = require("mongoose");

const alertHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    healthDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthData",
    },

    alertType: {
      type: String,
      enum: [
        "high_heart_rate",
        "low_oxygen",
        "high_glucose",
        "high_bp",
        "temperature_spike",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    resolvedAt: Date,
  },
  { timestamps: true }
);

alertHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("AlertHistory", alertHistorySchema);
