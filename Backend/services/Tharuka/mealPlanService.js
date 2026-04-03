import MealPlan from "../../models/Tharuka/MealPlan.js";
import User from "../../models/Imasha/User.js";
import nutritionApiService from "./nutritionApiService.js";
import reminderService from "./reminderService.js";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const HEALTH_CONDITIONS = [
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

function computeTotals(items = []) {
  return items.reduce(
    (acc, item) => {
      acc.totalCalories += Number(item.calories) || 0;
      acc.totalProtein += Number(item.protein) || 0;
      acc.totalCarbohydrates += Number(item.carbohydrates) || 0;
      acc.totalFat += Number(item.fat) || 0;
      acc.totalFiber += Number(item.fiber) || 0;
      return acc;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalFiber: 0,
    }
  );
}

async function enrichItemsWithNutrition(items) {
  const itemsNeedingData = items.filter(
    (item) => item.name && item.quantity && (!item.calories || !item.protein)
  );

  if (itemsNeedingData.length === 0) return items;

  try {
    const apiResults = await nutritionApiService.getMultipleFoodNutrition(itemsNeedingData);
    return items.map((item) => {
      const needsData = item.name && item.quantity && (!item.calories || !item.protein);
      if (needsData) {
        const apiIndex = itemsNeedingData.findIndex((i) => i.name === item.name && i.quantity === item.quantity);
        if (apiIndex >= 0 && apiResults[apiIndex]) {
          if (!apiResults[apiIndex].error) {
            return {
              ...item,
              calories: apiResults[apiIndex].calories || 0,
              protein: apiResults[apiIndex].protein || 0,
              carbohydrates: apiResults[apiIndex].carbohydrates || 0,
              fat: apiResults[apiIndex].fat || 0,
              fiber: apiResults[apiIndex].fiber || 0,
              nutritionStatus: "success",
            };
          } else {
            return {
              ...item,
              nutritionStatus: "error",
              nutritionError: apiResults[apiIndex].error,
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbohydrates: item.carbohydrates || 0,
              fat: item.fat || 0,
              fiber: item.fiber || 0,
            };
          }
        }
      }
      return item;
    });
  } catch (error) {
    console.warn("Failed to fetch nutrition data for meal plan items:", error.message);
    return items.map(item => ({
      ...item,
      nutritionStatus: "error",
      nutritionError: error.message,
      calories: item.calories || 0,
      protein: item.protein || 0,
    }));
  }
}

async function createMealPlan(userId, data) {
  const {
    planName,
    healthConditions = [],
    mealType,
    mealName,
    items = [],
    targetCalories,
    targetProtein,
    targetCarbohydrates,
    targetFat,
    scheduledDays = [],
    scheduledTime,
    startDate,
    endDate,
    notes,
    reminderEnabled = true,
    reminderMinutesBefore = 15,
    doctorId,
  } = data;

  if (!planName || !mealType || !MEAL_TYPES.includes(mealType)) {
    throw new Error("planName and mealType (breakfast/lunch/dinner/snack) are required");
  }

  if (scheduledDays.length > 0 && !scheduledTime) {
    throw new Error("scheduledTime is required when scheduledDays are provided");
  }

  let enrichedItems = items;
  if (items.length > 0) {
    enrichedItems = await enrichItemsWithNutrition(items);
  }

  const totals = computeTotals(enrichedItems);

  const mealPlan = await MealPlan.create({
    userId,
    doctorId,
    planName,
    healthConditions: healthConditions.filter((hc) => HEALTH_CONDITIONS.includes(hc)),
    mealType,
    mealName,
    items: enrichedItems,
    targetCalories: targetCalories || totals.totalCalories,
    targetProtein: targetProtein || totals.totalProtein,
    targetCarbohydrates: targetCarbohydrates || totals.totalCarbohydrates,
    targetFat: targetFat || totals.totalFat,
    scheduledDays,
    scheduledTime,
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
    notes,
    reminderEnabled,
    reminderMinutesBefore: Math.min(Math.max(0, reminderMinutesBefore || 15), 120),
    isActive: true,
  });

  if (reminderEnabled && scheduledDays.length > 0 && scheduledTime) {
    await reminderService.generateRemindersForActivePlans(userId);
  }

  return mealPlan;
}

async function getUserMealPlans(userId, options = {}) {
  const { healthCondition, mealType, isActive, limit = 50, page = 1 } = options;
  const query = { userId };

  if (healthCondition && HEALTH_CONDITIONS.includes(healthCondition)) {
    query.healthConditions = healthCondition;
  }
  if (mealType && MEAL_TYPES.includes(mealType)) {
    query.mealType = mealType;
  }
  if (isActive !== undefined) {
    query.isActive = isActive === true || isActive === "true";
  }

  const limitNum = Math.min(Math.max(1, Number(limit) || 50), 100);
  const pageNum = Math.max(1, Number(page) || 1);
  const skip = (pageNum - 1) * limitNum;

  const [plans, total] = await Promise.all([
    MealPlan.find(query)
      .populate("doctorId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MealPlan.countDocuments(query),
  ]);

  return {
    plans,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

async function getMealPlanById(id, userId) {
  const plan = await MealPlan.findOne({ _id: id, userId })
    .populate("doctorId", "firstName lastName email")
    .lean();
  return plan;
}

async function updateMealPlan(id, userId, data) {
  const plan = await MealPlan.findOne({ _id: id, userId });
  if (!plan) return null;

  const {
    planName,
    healthConditions,
    mealType,
    mealName,
    items,
    targetCalories,
    targetProtein,
    targetCarbohydrates,
    targetFat,
    scheduledDays,
    scheduledTime,
    startDate,
    endDate,
    notes,
    reminderEnabled,
    reminderMinutesBefore,
    isActive,
  } = data;

  if (planName != null) plan.planName = planName;
  if (healthConditions != null) {
    plan.healthConditions = Array.isArray(healthConditions)
      ? healthConditions.filter((hc) => HEALTH_CONDITIONS.includes(hc))
      : plan.healthConditions;
  }
  if (mealType != null && MEAL_TYPES.includes(mealType)) plan.mealType = mealType;
  if (mealName !== undefined) plan.mealName = mealName;
  if (notes !== undefined) plan.notes = notes;
  if (targetCalories != null) plan.targetCalories = targetCalories;
  if (targetProtein != null) plan.targetProtein = targetProtein;
  if (targetCarbohydrates != null) plan.targetCarbohydrates = targetCarbohydrates;
  if (targetFat != null) plan.targetFat = targetFat;
  if (scheduledDays != null) plan.scheduledDays = scheduledDays;
  if (scheduledTime != null) plan.scheduledTime = scheduledTime;
  if (startDate != null) plan.startDate = new Date(startDate);
  if (endDate !== undefined) plan.endDate = endDate ? new Date(endDate) : null;
  if (reminderEnabled !== undefined) plan.reminderEnabled = reminderEnabled;
  if (reminderMinutesBefore != null) {
    plan.reminderMinutesBefore = Math.min(Math.max(0, reminderMinutesBefore), 120);
  }
  if (isActive !== undefined) plan.isActive = isActive;

  if (items && Array.isArray(items)) {
    const enrichedItems = await enrichItemsWithNutrition(items);
    plan.items = enrichedItems;
    const totals = computeTotals(enrichedItems);
    if (!targetCalories) plan.targetCalories = totals.totalCalories;
    if (!targetProtein) plan.targetProtein = totals.totalProtein;
    if (!targetCarbohydrates) plan.targetCarbohydrates = totals.totalCarbohydrates;
    if (!targetFat) plan.targetFat = totals.totalFat;
  }

  await plan.save();

  if (plan.reminderEnabled && plan.scheduledDays.length > 0 && plan.scheduledTime) {
    await reminderService.generateRemindersForActivePlans(userId);
  }

  return plan;
}

async function deleteMealPlan(id, userId) {
  const deleted = await MealPlan.findOneAndDelete({ _id: id, userId });
  return deleted;
}

async function getMealPlansByHealthCondition(userId, healthCondition) {
  if (!HEALTH_CONDITIONS.includes(healthCondition)) {
    throw new Error(`Invalid health condition: ${healthCondition}`);
  }

  const plans = await MealPlan.find({
    userId,
    healthConditions: healthCondition,
    isActive: true,
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    startDate: { $lte: new Date() },
  })
    .populate("doctorId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  return plans;
}

async function suggestMealPlansForUser(userId, requestedMealType) {
  const user = await User.findById(userId).lean();
  if (!user || !user.healthConditions) {
    return [];
  }

  // Determine current meal type based on time
  // 9 PM to 9 AM: Breakfast
  // 9 AM to 2 PM: Lunch
  // 2 PM to 9 PM: Dinner
  const now = new Date();
  const hours = now.getHours();
  // FORCE requestedMealType to be used if provided, otherwise default to time-based
  let currentMealType = (requestedMealType || "").toLowerCase().trim();
  
  if (!currentMealType || !["breakfast", "lunch", "dinner", "snack"].includes(currentMealType)) {
    if (hours >= 9 && hours < 14) {
      currentMealType = "lunch";
    } else if (hours >= 14 && hours < 21) {
      currentMealType = "dinner";
    } else {
      currentMealType = "breakfast";
    }
  }
  
  console.log(`[AI Engine] User: ${userId}, Requested: ${requestedMealType}, Using: ${currentMealType}`);

  // AI Meal Generation Engine
  const AI_TEMPLATES = [
    // Diabetes
    {
      condition: "diabetes",
      planName: "AI: Diabetes Morning Boost",
      mealType: "breakfast",
      items: [
        { name: "oats", quantity: 50, unit: "g", calories: 190, protein: 7, carbohydrates: 32, fat: 3, fiber: 5 },
        { name: "almonds", quantity: 15, unit: "g", calories: 85, protein: 3, carbohydrates: 3, fat: 7, fiber: 2 },
      ],
      targetCalories: 275, targetProtein: 10, targetCarbohydrates: 35, targetFat: 10,
      scheduledDays: [1, 2, 3, 4, 5], scheduledTime: "08:00",
      notes: "AI Recommended: High-fiber start to manage blood glucose."
    },
    {
      condition: "diabetes",
      planName: "AI: Low-GI Diabetes Lunch",
      mealType: "lunch",
      items: [
        { name: "red rice", quantity: 150, unit: "g", calories: 283, protein: 6.8, carbohydrates: 60, fat: 2.3, fiber: 5.3 },
        { name: "chicken curry", quantity: 150, unit: "g", calories: 225, protein: 22.5, carbohydrates: 7.5, fat: 12, fiber: 2.3 },
      ],
      targetCalories: 508, targetProtein: 29.3, targetCarbohydrates: 67.5, targetFat: 14.3,
      scheduledDays: [1, 3, 5], scheduledTime: "13:00",
      notes: "AI Recommended: Balanced GI for stable afternoon energy."
    },
    {
      condition: "diabetes",
      planName: "AI: Diabetes Evening Balance",
      mealType: "dinner",
      items: [
        { name: "quinoa", quantity: 100, unit: "g", calories: 120, protein: 4, carbohydrates: 21, fat: 2, fiber: 3 },
        { name: "grilled fish", quantity: 150, unit: "g", calories: 180, protein: 25, carbohydrates: 0, fat: 8, fiber: 0 },
      ],
      targetCalories: 300, targetProtein: 29, targetCarbohydrates: 21, targetFat: 10,
      scheduledDays: [0, 2, 4, 6], scheduledTime: "19:30",
      notes: "AI Recommended: Lean protein focused dinner."
    },
    // Hypertension
    {
      condition: "hypertension",
      planName: "AI: Heart-Healthy Breakfast",
      mealType: "breakfast",
      items: [
        { name: "banana", quantity: 1, unit: "item", calories: 105, protein: 1.3, carbohydrates: 27, fat: 0.4, fiber: 3.1 },
        { name: "yogurt", quantity: 200, unit: "g", calories: 120, protein: 10, carbohydrates: 8, fat: 4, fiber: 0 },
      ],
      targetCalories: 225, targetProtein: 11.3, targetCarbohydrates: 35, targetFat: 4.4,
      scheduledDays: [1, 3, 5], scheduledTime: "07:30",
      notes: "AI Recommended: Potassium-rich breakfast for blood pressure."
    },
    {
      condition: "hypertension",
      planName: "AI: Low-Sodium Lunch",
      mealType: "lunch",
      items: [
        { name: "grilled chicken breast", quantity: 150, unit: "g", calories: 248, protein: 46, carbohydrates: 0, fat: 6, fiber: 0 },
        { name: "steamed broccoli", quantity: 200, unit: "g", calories: 70, protein: 5, carbohydrates: 14, fat: 1, fiber: 6 },
      ],
      targetCalories: 318, targetProtein: 51, targetCarbohydrates: 14, targetFat: 7,
      scheduledDays: [0, 2, 4, 6], scheduledTime: "12:30",
      notes: "AI Recommended: High protein, low salt lunch."
    },
    {
      condition: "hypertension",
      planName: "AI: Relaxing Heart Dinner",
      mealType: "dinner",
      items: [
        { name: "baked salmon", quantity: 150, unit: "g", calories: 312, protein: 30, carbohydrates: 0, fat: 20, fiber: 0 },
        { name: "leafy greens", quantity: 200, unit: "g", calories: 40, protein: 3, carbohydrates: 6, fat: 0, fiber: 4 },
      ],
      targetCalories: 352, targetProtein: 33, targetCarbohydrates: 6, targetFat: 20,
      scheduledDays: [1, 2, 4, 5], scheduledTime: "20:00",
      notes: "AI Recommended: Omega-3 focused dinner for heart health."
    },
    // Obesity
    {
      condition: "obesity",
      planName: "AI: Metabolic Start Breakfast",
      mealType: "breakfast",
      items: [
        { name: "egg whites", quantity: 4, unit: "items", calories: 68, protein: 14, carbohydrates: 1, fat: 0.2, fiber: 0 },
        { name: "whole grain toast", quantity: 1, unit: "slice", calories: 80, protein: 4, carbohydrates: 15, fat: 1, fiber: 3 },
      ],
      targetCalories: 148, targetProtein: 18, targetCarbohydrates: 16, targetFat: 1.2,
      scheduledDays: [1, 2, 3, 4, 5], scheduledTime: "08:00",
      notes: "AI Recommended: Low calorie, high protein satiety starter."
    },
    {
      condition: "obesity",
      planName: "AI: Lean Burn Lunch",
      mealType: "lunch",
      items: [
        { name: "turkey breast", quantity: 150, unit: "g", calories: 200, protein: 42, carbohydrates: 0, fat: 2, fiber: 0 },
        { name: "large mixed salad", quantity: 300, unit: "g", calories: 60, protein: 3, carbohydrates: 12, fat: 0, fiber: 5 },
      ],
      targetCalories: 260, targetProtein: 45, targetCarbohydrates: 12, targetFat: 2,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "13:30",
      notes: "AI Recommended: Volume eating for weight management."
    },
    {
      condition: "obesity",
      planName: "AI: Light Night Dinner",
      mealType: "dinner",
      items: [
        { name: "tofu", quantity: 200, unit: "g", calories: 150, protein: 16, carbohydrates: 4, fat: 8, fiber: 2 },
        { name: "vegetable stir-fry", quantity: 250, unit: "g", calories: 100, protein: 4, carbohydrates: 15, fat: 2, fiber: 6 },
      ],
      targetCalories: 250, targetProtein: 20, targetCarbohydrates: 19, targetFat: 10,
      scheduledDays: [0, 2, 4, 6], scheduledTime: "19:00",
      notes: "AI Recommended: Plant-based light dinner."
    },
    // Generic
    {
      condition: "generic",
      planName: "AI: Balanced Morning",
      mealType: "breakfast",
      items: [
        { name: "muesli", quantity: 60, unit: "g", calories: 220, protein: 6, carbohydrates: 40, fat: 4, fiber: 6 },
        { name: "milk", quantity: 200, unit: "ml", calories: 100, protein: 7, carbohydrates: 10, fat: 3, fiber: 0 },
      ],
      targetCalories: 320, targetProtein: 13, targetCarbohydrates: 50, targetFat: 7,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "07:30",
      notes: "AI Recommended: Balanced nutrients for general wellness."
    },
    {
      condition: "generic",
      planName: "AI: Energy Peak Lunch",
      mealType: "lunch",
      items: [
        { name: "brown rice", quantity: 150, unit: "g", calories: 165, protein: 3.5, carbohydrates: 35, fat: 1.2, fiber: 2.5 },
        { name: "beef stir-fry", quantity: 150, unit: "g", calories: 300, protein: 28, carbohydrates: 10, fat: 15, fiber: 2 },
      ],
      targetCalories: 465, targetProtein: 31.5, targetCarbohydrates: 45, targetFat: 16.2,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "12:30",
      notes: "AI Recommended: Standard balanced lunch."
    },
    {
      condition: "generic",
      planName: "AI: Reset Dinner",
      mealType: "dinner",
      items: [
        { name: "sweet potato", quantity: 200, unit: "g", calories: 170, protein: 3, carbohydrates: 40, fat: 0.2, fiber: 6 },
        { name: "roasted chicken", quantity: 150, unit: "g", calories: 250, protein: 35, carbohydrates: 0, fat: 12, fiber: 0 },
      ],
      targetCalories: 420, targetProtein: 38, targetCarbohydrates: 40, targetFat: 12.2,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "20:00",
      notes: "AI Recommended: Nourishing dinner to end the day."
    },
    // Generic Snack
    {
      condition: "generic",
      planName: "AI: Quick Vitality Snack",
      mealType: "snack",
      items: [
        { name: "apple", quantity: 1, unit: "item", calories: 95, protein: 0.5, carbohydrates: 25, fat: 0.3, fiber: 4.5 },
        { name: "walnuts", quantity: 20, unit: "g", calories: 130, protein: 3, carbohydrates: 3, fat: 13, fiber: 2 },
      ],
      targetCalories: 225, targetProtein: 3.5, targetCarbohydrates: 28, targetFat: 13.3,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "16:00",
      notes: "AI Recommended: Healthy fats and fiber for mid-day energy."
    },
    // Diabetes Snack
    {
      condition: "diabetes",
      planName: "AI: Steady-Sugar Snack",
      mealType: "snack",
      items: [
        { name: "greek yogurt", quantity: 150, unit: "g", calories: 90, protein: 15, carbohydrates: 6, fat: 0, fiber: 0 },
        { name: "chia seeds", quantity: 10, unit: "g", calories: 48, protein: 1.6, carbohydrates: 4, fat: 3, fiber: 3.4 },
      ],
      targetCalories: 138, targetProtein: 16.6, targetCarbohydrates: 10, targetFat: 3,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "16:30",
      notes: "AI Recommended: High protein snack to prevent sugar spikes."
    },
    // Hypertension Snack
    {
      condition: "hypertension",
      planName: "AI: Potassium Plus Snack",
      mealType: "snack",
      items: [
        { name: "apricots", quantity: 3, unit: "items", calories: 50, protein: 1, carbohydrates: 12, fat: 0, fiber: 2.5 },
        { name: "pistachios", quantity: 20, unit: "g", calories: 110, protein: 4, carbohydrates: 5, fat: 9, fiber: 2 },
      ],
      targetCalories: 160, targetProtein: 5, targetCarbohydrates: 17, targetFat: 9,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "15:45",
      notes: "AI Recommended: Natural electrolytes for cardiac support."
    },
    // Obesity Snack
    {
      condition: "obesity",
      planName: "AI: Zero-Guilt Snack",
      mealType: "snack",
      items: [
        { name: "cucumber slices", quantity: 100, unit: "g", calories: 15, protein: 0.7, carbohydrates: 3.6, fat: 0.1, fiber: 0.5 },
        { name: "hummus", quantity: 50, unit: "g", calories: 80, protein: 4, carbohydrates: 7, fat: 4, fiber: 2 },
      ],
      targetCalories: 95, targetProtein: 4.7, targetCarbohydrates: 10.6, targetFat: 4.1,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6], scheduledTime: "17:00",
      notes: "AI Recommended: Low calorie density snack."
    }
  ];

  // Filter templates by health conditions AND current meal type
  // Normalize conditions to lowercase for matching
  let rawConditions = user.healthConditions && user.healthConditions.length > 0 ? user.healthConditions : ["generic"];
  let userConditions = rawConditions.map(c => c.toLowerCase().trim());
  
  console.log(`[AI Engine] User conditions: ${JSON.stringify(userConditions)}`);
  console.log(`[AI Engine] Current meal type: ${currentMealType}`);

  let selectedTemplates = AI_TEMPLATES.filter(t => 
    userConditions.includes(t.condition.toLowerCase()) && t.mealType === currentMealType
  );

  console.log(`[AI Engine] Found ${selectedTemplates.length} matches for type ${currentMealType}`);

  // If no specific match found for conditions + type, fallback to generic + type
  if (selectedTemplates.length === 0) {
    console.log(`[AI Engine] No specific match, falling back to generic ${currentMealType}`);
    const fallback = AI_TEMPLATES.find(t => t.condition === "generic" && t.mealType === currentMealType);
    if (fallback) {
      selectedTemplates = [fallback];
    } else {
      console.log(`[AI Engine] EXTREME fallback to generic breakfast (first generic)`);
      selectedTemplates = [AI_TEMPLATES.find(t => t.condition === "generic")];
    }
  }

  const generatedDocs = [];
  for (const template of selectedTemplates) {
    const newPlan = await MealPlan.create({
      userId,
      planName: template.planName,
      healthConditions: template.condition === "generic" ? user.healthConditions : [template.condition],
      mealType: template.mealType,
      items: template.items,
      targetCalories: template.targetCalories,
      targetProtein: template.targetProtein,
      targetCarbohydrates: template.targetCarbohydrates,
      targetFat: template.targetFat,
      scheduledDays: template.scheduledDays,
      scheduledTime: template.scheduledTime,
      startDate: new Date(),
      endDate: null,
      notes: template.notes,
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isActive: true,
    });
    generatedDocs.push(newPlan.toObject());
  }

  await reminderService.generateRemindersForActivePlans(userId);
  return generatedDocs;
}

export default {
  createMealPlan,
  getUserMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  getMealPlansByHealthCondition,
  suggestMealPlansForUser,
};
