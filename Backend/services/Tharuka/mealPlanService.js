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
        if (apiIndex >= 0 && apiResults[apiIndex] && !apiResults[apiIndex].error) {
          return {
            ...item,
            calories: apiResults[apiIndex].calories || item.calories || 0,
            protein: apiResults[apiIndex].protein || item.protein || 0,
            carbohydrates: apiResults[apiIndex].carbohydrates || item.carbohydrates || 0,
            fat: apiResults[apiIndex].fat || item.fat || 0,
            fiber: apiResults[apiIndex].fiber || item.fiber || 0,
          };
        }
      }
      return item;
    });
  } catch (error) {
    console.warn("Failed to fetch nutrition data for meal plan items:", error.message);
    return items;
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
  if (!user || !user.healthConditions || user.healthConditions.length === 0) {
    return [];
  }

  const suggestedPlans = await MealPlan.find({
    userId,
    healthConditions: { $in: user.healthConditions },
    isActive: true,
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    startDate: { $lte: new Date() },
  })
    .populate("doctorId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return suggestedPlans;
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
