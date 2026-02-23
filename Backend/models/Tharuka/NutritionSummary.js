import mongoose from "mongoose";

const nutritionSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbohydrates: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalFiber: { type: Number, default: 0 },
    totalSugar: { type: Number, default: 0 },
    totalSodium: { type: Number, default: 0 },
  },
  { timestamps: true }
);

nutritionSummarySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("NutritionSummary", nutritionSummarySchema);
