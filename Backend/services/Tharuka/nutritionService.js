import Nutrition from "../../models/Tharuka/Nutrition.js";
import nutritionApiService from "./nutritionApiService.js";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

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

function sumRecords(records) {
  return records.reduce(
    (acc, r) => {
      acc.totalCalories += r.totalCalories || 0;
      acc.totalProtein += r.totalProtein || 0;
      acc.totalCarbohydrates += r.totalCarbohydrates || 0;
      acc.totalFat += r.totalFat || 0;
      acc.totalFiber += r.totalFiber || 0;
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

function getDateRange(type) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  if (type === "monthly") {
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

async function addMeal(userId, data) {
  const { mealType, mealName, items = [], notes, recordedAt, useApiForNutrition = true } = data;

  let enrichedItems = items;

  // If API is enabled and items have name + quantity (grams), fetch nutrition data
  if (useApiForNutrition && items.length > 0) {
    const itemsNeedingData = items.filter(
      (item) => item.name && item.quantity && (item.unit === "g" || item.unit === "gram" || item.unit === "grams" || !item.unit)
    );

    if (itemsNeedingData.length > 0) {
      try {
        const apiResults = await nutritionApiService.getMultipleFoodNutrition(itemsNeedingData);
        enrichedItems = items.map((item) => {
          const hasQuantity = item.name && item.quantity && (item.unit === "g" || item.unit === "gram" || item.unit === "grams" || !item.unit);
          if (hasQuantity) {
            const apiIndex = itemsNeedingData.findIndex(
              (i) => i.name === item.name && i.quantity === item.quantity
            );
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
        console.warn("Failed to fetch nutrition data from API, using provided values:", error.message);
      }
    }
  }

  const totals = computeTotals(enrichedItems);

  const entry = await Nutrition.create({
    userId,
    mealType,
    mealName,
    items: enrichedItems,
    ...totals,
    notes,
    recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
  });
  return entry;
}

async function getUserNutrition(userId, options = {}) {
  const { date, mealType, limit = 50, page = 1 } = options;
  const query = { userId };

  if (mealType && MEAL_TYPES.includes(mealType)) {
    query.mealType = mealType;
  }

  if (date) {
    const d = new Date(date);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    query.recordedAt = { $gte: dayStart, $lte: dayEnd };
  }

  const limitNum = Math.min(Math.max(1, Number(limit) || 50), 100);
  const pageNum = Math.max(1, Number(page) || 1);
  const skip = (pageNum - 1) * limitNum;

  const [records, total] = await Promise.all([
    Nutrition.find(query).sort({ recordedAt: -1 }).skip(skip).limit(limitNum).lean(),
    Nutrition.countDocuments(query),
  ]);

  const dailySummary = sumRecords(records);
  return {
    records,
    dailySummary,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

async function updateMeal(id, userId, data) {
  const meal = await Nutrition.findOne({ _id: id, userId });
  if (!meal) return null;

  const { mealType, mealName, items, notes, recordedAt } = data;
  if (mealType != null) meal.mealType = mealType;
  if (mealName != null) meal.mealName = mealName;
  if (notes !== undefined) meal.notes = notes;
  if (recordedAt != null) meal.recordedAt = new Date(recordedAt);

  if (items && Array.isArray(items)) {
    // If items have quantity/grams, try to fetch nutrition data from API
    const itemsWithQuantity = items.filter(
      (item) => item.name && item.quantity && (item.unit === "g" || item.unit === "gram" || item.unit === "grams" || !item.unit)
    );
    
    if (itemsWithQuantity.length > 0) {
      try {
        const apiResults = await nutritionApiService.getMultipleFoodNutrition(itemsWithQuantity);
        const enrichedItems = items.map((item) => {
          const hasQuantity = item.name && item.quantity && (item.unit === "g" || item.unit === "gram" || item.unit === "grams" || !item.unit);
          if (hasQuantity) {
            const apiIndex = itemsWithQuantity.findIndex(
              (i) => i.name === item.name && i.quantity === item.quantity
            );
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
        meal.items = enrichedItems;
        Object.assign(meal, computeTotals(enrichedItems));
      } catch (error) {
        console.warn("Failed to fetch nutrition data for update, using provided values:", error.message);
        meal.items = items;
        Object.assign(meal, computeTotals(items));
      }
    } else {
      meal.items = items;
      Object.assign(meal, computeTotals(items));
    }
  }

  await meal.save();
  return meal;
}

async function deleteMeal(id, userId) {
  const deleted = await Nutrition.findOneAndDelete({ _id: id, userId });
  return deleted;
}

async function addDoctorRecommendation(nutritionId, doctorId, recommendation) {
  const meal = await Nutrition.findById(nutritionId);
  if (!meal) return null;

  meal.doctorRecommendation = {
    doctorId,
    ...recommendation,
    createdAt: new Date(),
  };
  await meal.save();
  return meal;
}

async function getNutritionAnalysis(userId, type = "weekly") {
  const reportType = type === "monthly" ? "monthly" : "weekly";
  const { start, end } = getDateRange(reportType);

  const records = await Nutrition.find({
    userId,
    recordedAt: { $gte: start, $lte: end },
  })
    .sort({ recordedAt: 1 })
    .lean();

  const mealTypeBreakdown = records.reduce((acc, r) => {
    acc[r.mealType] = (acc[r.mealType] || 0) + 1;
    return acc;
  }, {});

  const totals = sumRecords(records);
  const daysInPeriod = reportType === "weekly" ? 7 : 30;
  const round2 = (n) => Math.round((n / daysInPeriod) * 100) / 100;
  const averages = {
    avgDailyCalories: round2(totals.totalCalories),
    avgDailyProtein: round2(totals.totalProtein),
    avgDailyCarbohydrates: round2(totals.totalCarbohydrates),
    avgDailyFat: round2(totals.totalFat),
    avgDailyFiber: round2(totals.totalFiber),
  };

  const topCalorieMeals = [...records]
    .sort((a, b) => (b.totalCalories || 0) - (a.totalCalories || 0))
    .slice(0, 5)
    .map((r) => ({
      mealName: r.mealName || r.mealType,
      calories: r.totalCalories,
      date: r.recordedAt,
    }));

  return {
    period: { start, end },
    reportType,
    totalMeals: records.length,
    mealTypeBreakdown,
    totals,
    averages,
    topCalorieMeals,
  };
}

export default {
  addMeal,
  getUserNutrition,
  updateMeal,
  deleteMeal,
  addDoctorRecommendation,
  getNutritionAnalysis,
};
