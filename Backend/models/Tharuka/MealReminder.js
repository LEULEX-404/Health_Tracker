import mongoose from "mongoose";

const mealReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    reminderTime: {
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    mealName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "sent", "completed", "skipped", "cancelled"],
      default: "pending",
      index: true,
    },
    sentAt: Date,
    completedAt: Date,
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mealReminderSchema.index({ userId: 1, status: 1, reminderTime: 1 });
mealReminderSchema.index({ reminderTime: 1, status: "pending" });

export default mongoose.model("MealReminder", mealReminderSchema);
