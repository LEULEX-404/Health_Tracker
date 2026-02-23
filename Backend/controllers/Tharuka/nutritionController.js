import nutritionService from "../../services/Tharuka/nutritionService.js";

const ok = (res, data, meta = {}) => res.status(200).json({ success: true, ...meta, data });
const created = (res, data) => res.status(201).json({ success: true, message: "Meal logged successfully", data });
const badRequest = (res, message) => res.status(400).json({ success: false, message });
const notFound = (res, message = "Not found") => res.status(404).json({ success: false, message });
const serverError = (res, message) => res.status(500).json({ success: false, message });

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export const addMeal = async (req, res) => {
  try {
    const { userId, mealType, mealName, items, notes, recordedAt } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    if (!mealType || !MEAL_TYPES.includes(mealType)) {
      return badRequest(res, "mealType is required and must be one of: breakfast, lunch, dinner, snack");
    }
    const entry = await nutritionService.addMeal(userId, {
      mealType,
      mealName,
      items,
      notes,
      recordedAt,
    });
    return created(res, entry);
  } catch (err) {
    console.error("addMeal:", err.message);
    return serverError(res, err.message);
  }
};

export const getUserNutrition = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, mealType, limit, page } = req.query;
    const result = await nutritionService.getUserNutrition(userId, { date, mealType, limit, page });
    return ok(res, result.records, {
      count: result.records.length,
      dailySummary: result.dailySummary,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("getUserNutrition:", err.message);
    return serverError(res, err.message);
  }
};

export const updateMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...data } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const updated = await nutritionService.updateMeal(id, userId, data);
    if (!updated) return notFound(res, "Meal not found");
    return ok(res, updated, { message: "Meal updated successfully" });
  } catch (err) {
    console.error("updateMeal:", err.message);
    return serverError(res, err.message);
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const deleted = await nutritionService.deleteMeal(id, userId);
    if (!deleted) return notFound(res, "Meal not found");
    return ok(res, null, { message: "Meal deleted successfully" });
  } catch (err) {
    console.error("deleteMeal:", err.message);
    return serverError(res, err.message);
  }
};

export const addDoctorRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctorId,
      message,
      targetCalories,
      targetProtein,
      targetCarbohydrates,
      targetFat,
    } = req.body;
    if (!doctorId) return badRequest(res, "doctorId is required");
    const updated = await nutritionService.addDoctorRecommendation(id, doctorId, {
      message,
      targetCalories,
      targetProtein,
      targetCarbohydrates,
      targetFat,
    });
    if (!updated) return notFound(res, "Nutrition record not found");
    return ok(res, updated, { message: "Doctor recommendation added" });
  } catch (err) {
    console.error("addDoctorRecommendation:", err.message);
    return serverError(res, err.message);
  }
};

export const getNutritionAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = "weekly" } = req.query;
    const analysis = await nutritionService.getNutritionAnalysis(userId, type);
    return ok(res, analysis);
  } catch (err) {
    console.error("getNutritionAnalysis:", err.message);
    return serverError(res, err.message);
  }
};

export default {
  addMeal,
  getUserNutrition,
  updateMeal,
  deleteMeal,
  addDoctorRecommendation,
  getNutritionAnalysis,
};
