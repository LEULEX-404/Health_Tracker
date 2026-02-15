import mongoose from "mongoose";


const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true,
    },
    ipAddress: String,
    success: {
      type: Boolean,
      default: false,
    },
    attemptTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

loginAttemptSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model("LoginAttempt", loginAttemptSchema);