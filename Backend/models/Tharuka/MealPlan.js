import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "g", trim: true },
    calories: { type: Number, min: 0, default: 0 },
    protein: { type: Number, min: 0, default: 0 },
    carbohydrates: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
    fiber: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    healthConditions: {
      type: [String],
      default: [],
      enum: [
        "diabetes",
        "hypertension",
        "obesity",
        "heart_disease",
        "kidney_disease",
        "celiac",
        "lactose_intolerant",
        "high_cholesterol",
        "anemia",
        "osteoporosis",
        "other",
      ],
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    mealName: { type: String, trim: true },
    items: { type: [mealItemSchema], default: [] },
    targetCalories: { type: Number, min: 0 },
    targetProtein: { type: Number, min: 0 },
    targetCarbohydrates: { type: Number, min: 0 },
    targetFat: { type: Number, min: 0 },
    scheduledDays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) => days.every((d) => d >= 0 && d <= 6),
        message: "Days must be 0-6 (Sunday-Saturday)",
      },
    },
    scheduledTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
    reminderEnabled: { type: Boolean, default: true },
    reminderMinutesBefore: { type: Number, default: 15, min: 0, max: 120 },
  },
  { timestamps: true }
);

mealPlanSchema.index({ userId: 1, isActive: 1 });
mealPlanSchema.index({ userId: 1, scheduledDays: 1 });
mealPlanSchema.index({ userId: 1, scheduledTime: 1 });

export default mongoose.model("MealPlan", mealPlanSchema);
