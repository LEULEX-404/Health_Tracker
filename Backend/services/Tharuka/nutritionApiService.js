import axios from "axios";

// ─── Open Food Facts: FREE, no API key, works worldwide including Sri Lanka ───
const OPEN_FOOD_FACTS_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const OPEN_FOOD_FACTS_USER_AGENT = "HealthTracker-SriLanka/1.0 (Nutrition; Sri Lanka)";

// ─── CalorieNinjas: FREE tier 10,000 calls/month, no credit card ───
// Get key at https://calorieninjas.com/api (free signup)
const CALORIENINJAS_URL = "https://api.calorieninjas.com/v1/nutrition";
const CALORIENINJAS_API_KEY = process.env.CALORIENINJAS_API_KEY;

/**
 * Open Food Facts – free, no key, global (incl. Sri Lanka)
 * Uses User-Agent per API policy: https://wiki.openfoodfacts.org/API
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

    // Prefer product with nutriments
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
      sugar: Math.round(getVal("sugars_100g", "sugars") * 10) / 10,
      sodium: Math.round(getVal("sodium_100g", "sodium") * 10) / 10,
    };
  } catch (err) {
    if (err.response) throw new Error(`Open Food Facts: ${err.response.status}`);
    throw new Error(err.message || "Open Food Facts request failed");
  }
}

/**
 * CalorieNinjas – free tier (10k calls/month), works globally including Sri Lanka
 * Query format: "100g rice" or "rice 100 grams"
 */
async function getNutritionDataCalorieNinjas(foodName, quantity, unit = "g") {
  if (!CALORIENINJAS_API_KEY) {
    throw new Error("CalorieNinjas API key not set (optional; get free key at calorieninjas.com/api)");
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

    // Sum when API returns multiple items (e.g. "rice and dhal")
    const total = items.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein_g) || 0;
        acc.carbohydrates += Number(item.carbohydrates_total_g) || 0;
        acc.fat += Number(item.fat_total_g) || 0;
        acc.fiber += Number(item.fiber_g) || 0;
        acc.sugar += Number(item.sugar_g) || 0;
        acc.sodium += Number(item.sodium_mg) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    return {
      calories: Math.round(total.calories),
      protein: Math.round(total.protein * 10) / 10,
      carbohydrates: Math.round(total.carbohydrates * 10) / 10,
      fat: Math.round(total.fat * 10) / 10,
      fiber: Math.round(total.fiber * 10) / 10,
      sugar: Math.round(total.sugar * 10) / 10,
      sodium: Math.round(total.sodium * 10) / 10,
    };
  } catch (err) {
    if (err.response?.status === 401) throw new Error("Invalid CalorieNinjas API key");
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "CalorieNinjas request failed");
  }
}

/**
 * Get nutrition for one food. Uses free APIs available in Sri Lanka:
 * 1. Open Food Facts (no key)
 * 2. CalorieNinjas (optional free key)
 */
async function getNutritionData(foodName, quantity, unit = "g") {
  const qty = quantity || 100;
  const u = (unit || "g").toLowerCase();

  // Try Open Food Facts first (no config needed)
  try {
    return await getNutritionDataOpenFoodFacts(foodName, qty, u);
  } catch (offErr) {
    if (CALORIENINJAS_API_KEY) {
      try {
        return await getNutritionDataCalorieNinjas(foodName, qty, u);
      } catch (cnErr) {
        throw new Error(`Nutrition lookup failed. Open Food Facts: ${offErr.message}; CalorieNinjas: ${cnErr.message}`);
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
