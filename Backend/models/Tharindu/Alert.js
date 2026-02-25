import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    parameter: {
      type: String, // heartRate, bloodPressure, etc.
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    minThreshold: Number,
    maxThreshold: Number,

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
      index: true,
    },

    status: {
      type: String,
      enum: ["New", "Acknowledged", "Resolved"],
      default: "New",
      index: true,
    },

    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },

    resolvedAt: Date,
  },

  { timestamps: true },
);

alertSchema.index({ userId: 1, triggeredAt: -1 });

export default mongoose.model("Alert", alertSchema);
