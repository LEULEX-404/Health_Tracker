import mongoose from "mongoose";

const allowedMealTypes = ["breakfast", "lunch", "dinner", "snack"];
const allowedStatuses = ["pending", "sent", "completed", "skipped", "cancelled"];

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
      index: true,
    },
    /**
     * Date-only anchor for the meal occurrence.
     * Stored normalized to 00:00:00.000 local server time.
     */
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    /**
     * Actual time at which the reminder should be delivered.
     */
    reminderTime: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: allowedMealTypes,
      required: true,
    },
    mealName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: "pending",
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastError: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

mealReminderSchema.pre("validate", function () {
  if (this.scheduledDate) {
    const normalized = new Date(this.scheduledDate);
    normalized.setHours(0, 0, 0, 0);
    this.scheduledDate = normalized;
  }

  if (this.completedAt && this.status !== "completed") {
    throw new Error("completedAt can only be set when status is 'completed'");
  }

  if (this.sentAt && this.status === "pending") {
    throw new Error("sentAt cannot be set while status is 'pending'");
  }
});

// Fast query for due pending reminders
mealReminderSchema.index({ userId: 1, status: 1, reminderTime: 1 });

// Fast query for workers that fetch all due pending reminders
mealReminderSchema.index(
  { reminderTime: 1 },
  { partialFilterExpression: { status: "pending" } }
);

// Prevent duplicate reminders for the same plan on the same meal date
mealReminderSchema.index(
  { mealPlanId: 1, scheduledDate: 1 },
  { unique: true }
);

export default mongoose.model("MealReminder", mealReminderSchema);
