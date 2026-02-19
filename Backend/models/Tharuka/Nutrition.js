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

const doctorRecommendationSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, trim: true },
    targetCalories: { type: Number, min: 0 },
    targetProtein: { type: Number, min: 0 },
    targetCarbohydrates: { type: Number, min: 0 },
    targetFat: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    mealName: { type: String, trim: true },
    items: { type: [mealItemSchema], default: [] },

    totalCalories: { type: Number, min: 0, default: 0 },
    totalProtein: { type: Number, min: 0, default: 0 },
    totalCarbohydrates: { type: Number, min: 0, default: 0 },
    totalFat: { type: Number, min: 0, default: 0 },
    totalFiber: { type: Number, min: 0, default: 0 },

    notes: { type: String, trim: true },
    doctorRecommendation: doctorRecommendationSchema,
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

nutritionSchema.index({ userId: 1, recordedAt: -1 });
nutritionSchema.index({ userId: 1, mealType: 1 });

export default mongoose.model("Nutrition", nutritionSchema);
