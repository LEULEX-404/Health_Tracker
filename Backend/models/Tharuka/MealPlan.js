import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "g",
      trim: true,
    },
    calories: {
      type: Number,
      min: 0,
      default: 0,
    },
    protein: {
      type: Number,
      min: 0,
      default: 0,
    },
    carbohydrates: {
      type: Number,
      min: 0,
      default: 0,
    },
    fat: {
      type: Number,
      min: 0,
      default: 0,
    },
    fiber: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const allowedHealthConditions = [
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
];

const allowedMealTypes = ["breakfast", "lunch", "dinner", "snack"];

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
      default: null,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    healthConditions: {
      type: [String],
      default: [],
      validate: {
        validator: (values) =>
          Array.isArray(values) &&
          values.every((value) => allowedHealthConditions.includes(value)),
        message: "Invalid health condition provided",
      },
      set: (values) => [...new Set(values || [])],
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
    items: {
      type: [mealItemSchema],
      default: [],
    },
    targetCalories: {
      type: Number,
      min: 0,
      default: null,
    },
    targetProtein: {
      type: Number,
      min: 0,
      default: null,
    },
    targetCarbohydrates: {
      type: Number,
      min: 0,
      default: null,
    },
    targetFat: {
      type: Number,
      min: 0,
      default: null,
    },
    scheduledDays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) => {
          if (!Array.isArray(days)) return false;

          const allValid = days.every(
            (d) => Number.isInteger(d) && d >= 0 && d <= 6
          );

          const unique = new Set(days).size === days.length;

          return allValid && unique;
        },
        message: "scheduledDays must contain unique integers from 0 to 6",
      },
    },
    scheduledTime: {
      type: String,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderMinutesBefore: {
      type: Number,
      default: 15,
      min: 0,
      max: 120,
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.pre("validate", function () {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    throw new Error("endDate must be greater than or equal to startDate");
  }

  if (this.reminderEnabled) {
    if (!Array.isArray(this.scheduledDays) || this.scheduledDays.length === 0) {
      throw new Error("scheduledDays is required when reminders are enabled");
    }

    if (!this.scheduledTime) {
      throw new Error("scheduledTime is required when reminders are enabled");
    }
  }
});

// Useful query indexes
mealPlanSchema.index({ userId: 1, isActive: 1 });
mealPlanSchema.index({ userId: 1, reminderEnabled: 1, isActive: 1 });
mealPlanSchema.index({ userId: 1, startDate: 1, endDate: 1 });
mealPlanSchema.index({ userId: 1, scheduledTime: 1 });

export default mongoose.model("MealPlan", mealPlanSchema);
