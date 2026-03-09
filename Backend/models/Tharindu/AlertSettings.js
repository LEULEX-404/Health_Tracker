import mongoose from "mongoose";

const alertSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    heartRateMax: Number,
    oxygenMin: Number,
    glucoseMax: Number,
    escalationTimeMinutes: {
      type: Number,
      default: 10,
    },
    smsEnabled: {
      type: Boolean,
      default: false,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AlertSettings", alertSettingsSchema);

