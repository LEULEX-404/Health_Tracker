import mealPlanService from "../../services/Tharuka/mealPlanService.js";

const ok = (res, data, meta = {}) => res.status(200).json({ success: true, ...meta, data });
const created = (res, data) => res.status(201).json({ success: true, message: "Meal plan created successfully", data });
const badRequest = (res, message) => res.status(400).json({ success: false, message });
const notFound = (res, message = "Not found") => res.status(404).json({ success: false, message });
const serverError = (res, message) => res.status(500).json({ success: false, message });

export const createMealPlan = async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const plan = await mealPlanService.createMealPlan(userId, data);
    return created(res, plan);
  } catch (err) {
    console.error("createMealPlan:", err.message);
    return err.message.includes("required") || err.message.includes("Invalid")
      ? badRequest(res, err.message)
      : serverError(res, err.message);
  }
};

export const getUserMealPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const { healthCondition, mealType, isActive, limit, page } = req.query;
    const result = await mealPlanService.getUserMealPlans(userId, {
      healthCondition,
      mealType,
      isActive,
      limit,
      page,
    });
    return ok(res, result.plans, { pagination: result.pagination });
  } catch (err) {
    console.error("getUserMealPlans:", err.message);
    return serverError(res, err.message);
  }
};

export const getMealPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return badRequest(res, "userId is required");
    const plan = await mealPlanService.getMealPlanById(id, userId);
    if (!plan) return notFound(res, "Meal plan not found");
    return ok(res, plan);
  } catch (err) {
    console.error("getMealPlanById:", err.message);
    return serverError(res, err.message);
  }
};

export const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...data } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const updated = await mealPlanService.updateMealPlan(id, userId, data);
    if (!updated) return notFound(res, "Meal plan not found");
    return ok(res, updated, { message: "Meal plan updated successfully" });
  } catch (err) {
    console.error("updateMealPlan:", err.message);
    return serverError(res, err.message);
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const deleted = await mealPlanService.deleteMealPlan(id, userId);
    if (!deleted) return notFound(res, "Meal plan not found");
    return ok(res, null, { message: "Meal plan deleted successfully" });
  } catch (err) {
    console.error("deleteMealPlan:", err.message);
    return serverError(res, err.message);
  }
};

export const getMealPlansByHealthCondition = async (req, res) => {
  try {
    const { userId, healthCondition } = req.params;
    const plans = await mealPlanService.getMealPlansByHealthCondition(userId, healthCondition);
    return ok(res, plans);
  } catch (err) {
    console.error("getMealPlansByHealthCondition:", err.message);
    return err.message.includes("Invalid")
      ? badRequest(res, err.message)
      : serverError(res, err.message);
  }
};

export const suggestMealPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const plans = await mealPlanService.suggestMealPlansForUser(userId);
    return ok(res, plans);
  } catch (err) {
    console.error("suggestMealPlans:", err.message);
    return serverError(res, err.message);
  }
};

export default {
  createMealPlan,
  getUserMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  getMealPlansByHealthCondition,
  suggestMealPlans,
};
