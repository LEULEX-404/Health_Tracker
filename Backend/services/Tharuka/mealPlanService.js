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

async function suggestMealPlansForUser(userId) {
  const user = await User.findById(userId).lean();
  if (!user || !user.healthConditions) {
    return [];
  }


  // AI Meal Generation Engine: Always generate fresh plans for the user
  const AI_TEMPLATES = [
    {
      condition: "diabetes",
      planName: "AI: Low-GI Diabetes Care Plan",
      mealType: "lunch",
      items: [
        { name: "red rice", quantity: 150, unit: "g", calories: 283, protein: 6.8, carbohydrates: 60, fat: 2.3, fiber: 5.3 },
        { name: "chicken curry", quantity: 150, unit: "g", calories: 225, protein: 22.5, carbohydrates: 7.5, fat: 12, fiber: 2.3 },
        { name: "dhal curry", quantity: 100, unit: "g", calories: 120, protein: 8, carbohydrates: 15, fat: 4, fiber: 6 },
      ],
      targetCalories: 628, targetProtein: 37.3, targetCarbohydrates: 82.5, targetFat: 18.3,
      scheduledDays: [1, 3, 5],
      scheduledTime: "13:00",
      notes: "AI Recommended: Focuses on complex carbohydrates to avoid blood sugar spikes."
    },
    {
      condition: "hypertension",
      planName: "AI: Low Sodium Heart Plan",
      mealType: "dinner",
      items: [
        { name: "white rice", quantity: 150, unit: "g", calories: 195, protein: 4, carbohydrates: 42, fat: 0.5, fiber: 0.6 },
        { name: "fish", quantity: 150, unit: "g", calories: 307, protein: 33, carbohydrates: 0, fat: 18, fiber: 0 },
        { name: "vegetable salad", quantity: 200, unit: "g", calories: 50, protein: 2, carbohydrates: 10, fat: 0, fiber: 4 },
      ],
      targetCalories: 552, targetProtein: 39, targetCarbohydrates: 52, targetFat: 18.5,
      scheduledDays: [0, 2, 4, 6],
      scheduledTime: "19:30",
      notes: "AI Recommended: Balanced dinner with lean protein and low sodium."
    },
    {
      condition: "obesity",
      planName: "AI: Calorie Deficit Plan",
      mealType: "breakfast",
      items: [
        { name: "egg", quantity: 2, unit: "items", calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0 },
        { name: "bread", quantity: 2, unit: "slices", calories: 160, protein: 6, carbohydrates: 30, fat: 2, fiber: 2 },
        { name: "milk", quantity: 250, unit: "ml", calories: 105, protein: 8.5, carbohydrates: 12.5, fat: 2.5, fiber: 0 },
      ],
      targetCalories: 420, targetProtein: 27.5, targetCarbohydrates: 43.6, targetFat: 15.5,
      scheduledDays: [1, 2, 3, 4, 5],
      scheduledTime: "08:00",
      notes: "AI Recommended: High protein breakfast to induce satiety."
    },
    {
      condition: "generic",
      planName: "AI: Balanced Wellness Plan",
      mealType: "lunch",
      items: [
        { name: "rice", quantity: 200, unit: "g", calories: 260, protein: 5.4, carbohydrates: 56, fat: 0.6, fiber: 0.8 },
        { name: "chicken", quantity: 150, unit: "g", calories: 358, protein: 40.5, carbohydrates: 0, fat: 21, fiber: 0 },
        { name: "dhal", quantity: 100, unit: "g", calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, fiber: 8 },
      ],
      targetCalories: 734, targetProtein: 54.9, targetCarbohydrates: 76, targetFat: 22,
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      scheduledTime: "12:30",
      notes: "AI Recommended: A standard balanced lunch template."
    }
  ];

  let selectedTemplates = AI_TEMPLATES.filter(t => user.healthConditions.includes(t.condition));
  if (selectedTemplates.length === 0) {
    selectedTemplates = [AI_TEMPLATES.find(t => t.condition === "generic")];
  }

  const generatedDocs = [];
  for (const template of selectedTemplates) {
    // Save to the database as an active plan for the user
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

  // Trigger reminders recalculation since new AI plans have been inserted
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
