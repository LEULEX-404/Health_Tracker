import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "sms", "toast", "inApp"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: Date,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

