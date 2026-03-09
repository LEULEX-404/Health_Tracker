import axios from "axios";

// ─── Open Food Facts: FREE, no API key, works worldwide including Sri Lanka ───
const OPEN_FOOD_FACTS_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const OPEN_FOOD_FACTS_USER_AGENT = "HealthTracker-SriLanka/1.0 (Nutrition; Sri Lanka)";

// ─── CalorieNinjas: FREE tier 10,000 calls/month, no credit card ───
// Get key at https://calorieninjas.com/api (free signup)
const CALORIENINJAS_URL = "https://api.calorieninjas.com/v1/nutrition";
const CALORIENINJAS_API_KEY = process.env.CALORIENINJAS_API_KEY;

// ─── Local Dictionary for Common Sri Lankan / Generic Foods ───
// Values per 100g
const COMMON_FOODS = {
  rice: { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4 },
  "white rice": { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4 },
  "red rice": { calories: 189, protein: 4.5, carbohydrates: 40, fat: 1.5, fiber: 3.5 },
  chicken: { calories: 239, protein: 27, carbohydrates: 0, fat: 14, fiber: 0 },
  "chicken curry": { calories: 150, protein: 15, carbohydrates: 5, fat: 8, fiber: 1.5 },
  "dhal": { calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, fiber: 8 },
  "dhal curry": { calories: 120, protein: 8, carbohydrates: 15, fat: 4, fiber: 6 },
  egg: { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0 },
  milk: { calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, fiber: 0 },
  banana: { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6 },
  apple: { calories: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4 },
  bread: { calories: 265, protein: 9, carbohydrates: 49, fat: 3.2, fiber: 2.7 },
  fish: { calories: 205, protein: 22, carbohydrates: 0, fat: 12, fiber: 0 },
};

/**
 * Open Food Facts – free, no key, global (incl. Sri Lanka)
 */
async function getNutritionDataOpenFoodFacts(foodName, quantity, unit = "g") {
  try {
    const { data } = await axios.get(OPEN_FOOD_FACTS_SEARCH, {
      params: {
        search_terms: foodName,
        json: 1,
        page_size: 3,
      },
      headers: { "User-Agent": OPEN_FOOD_FACTS_USER_AGENT },
      timeout: 12000,
    });

    if (!data?.products?.length) {
      throw new Error(`No food found for "${foodName}"`);
    }

    const product = data.products.find((p) => p.nutriments && (p.nutriments["energy-kcal_100g"] != null || p.nutriments.proteins_100g != null))
      || data.products[0];
    const nutriments = product.nutriments || {};

    const mult = quantity / 100;

    const getVal = (...keys) => {
      for (const k of keys) {
        const v = nutriments[k];
        if (v != null && !Number.isNaN(Number(v))) return Number(v) * mult;
      }
      return 0;
    };

    return {
      calories: Math.round(getVal("energy-kcal_100g", "energy-kcal")),
      protein: Math.round(getVal("proteins_100g", "proteins") * 10) / 10,
      carbohydrates: Math.round(getVal("carbohydrates_100g", "carbohydrates") * 10) / 10,
      fat: Math.round(getVal("fat_100g", "fat") * 10) / 10,
      fiber: Math.round(getVal("fiber_100g", "fiber") * 10) / 10,
    };
  } catch (err) {
    if (err.response) throw new Error(`Open Food Facts: ${err.response.status}`);
    throw new Error(err.message || "Open Food Facts request failed");
  }
}

/**
 * CalorieNinjas – free tier
 */
async function getNutritionDataCalorieNinjas(foodName, quantity, unit = "g") {
  if (!CALORIENINJAS_API_KEY) {
    throw new Error("CalorieNinjas API key not set");
  }

  const query = `${quantity}${unit === "g" ? "g" : unit} ${foodName}`.trim();

  try {
    const { data } = await axios.get(CALORIENINJAS_URL, {
      params: { query },
      headers: { "X-Api-Key": CALORIENINJAS_API_KEY },
      timeout: 10000,
    });

    const items = data?.items;
    if (!items?.length) {
      throw new Error(`No nutrition data for "${foodName}"`);
    }

    const total = items.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein_g) || 0;
        acc.carbohydrates += Number(item.carbohydrates_total_g) || 0;
        acc.fat += Number(item.fat_total_g) || 0;
        acc.fiber += Number(item.fiber_g) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );

    return {
      calories: Math.round(total.calories),
      protein: Math.round(total.protein * 10) / 10,
      carbohydrates: Math.round(total.carbohydrates * 10) / 10,
      fat: Math.round(total.fat * 10) / 10,
      fiber: Math.round(total.fiber * 10) / 10,
    };
  } catch (err) {
    if (err.response?.status === 401) throw new Error("Invalid CalorieNinjas API key");
    throw new Error(err.message || "CalorieNinjas request failed");
  }
}

/**
 * Get nutrition for one food.
 */
async function getNutritionData(foodName, quantity, unit = "g") {
  const qty = quantity || 100;
  const u = (unit || "g").toLowerCase();
  const nameLower = (foodName || "").toLowerCase().trim();

  // 1. Local Dictionary
  if (COMMON_FOODS[nameLower]) {
    const base = COMMON_FOODS[nameLower];
    const mult = qty / 100;
    return {
      calories: Math.round(base.calories * mult),
      protein: Math.round(base.protein * mult * 10) / 10,
      carbohydrates: Math.round(base.carbohydrates * mult * 10) / 10,
      fat: Math.round(base.fat * mult * 10) / 10,
      fiber: Math.round(base.fiber * mult * 10) / 10,
      source: "local_dictionary",
    };
  }

  // 2. Open Food Facts
  try {
    const data = await getNutritionDataOpenFoodFacts(foodName, qty, u);
    return { ...data, source: "open_food_facts" };
  } catch (offErr) {
    if (CALORIENINJAS_API_KEY) {
      try {
        const data = await getNutritionDataCalorieNinjas(foodName, qty, u);
        return { ...data, source: "calorie_ninjas" };
      } catch (cnErr) {
        throw new Error(`Nutrition lookup failed. OFF: ${offErr.message}; CN: ${cnErr.message}`);
      }
    }
    throw offErr;
  }
}

async function getMultipleFoodNutrition(foodItems) {
  const results = await Promise.allSettled(
    foodItems.map((item) =>
      getNutritionData(item.name, item.quantity || 100, item.unit || "g")
    )
  );

  return results.map((result, index) => {
    const item = foodItems[index];
    if (result.status === "fulfilled") {
      return {
        name: item.name,
        quantity: item.quantity || 100,
        unit: item.unit || "g",
        ...result.value,
      };
    }
    return {
      name: item.name,
      quantity: item.quantity || 100,
      unit: item.unit || "g",
      error: result.reason?.message || "Unknown error",
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    };
  });
}

export default {
  getNutritionData,
  getMultipleFoodNutrition,
};
