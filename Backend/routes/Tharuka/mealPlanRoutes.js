import express from "express";
import * as controller from "../../controllers/Tharuka/mealPlanController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

const router = express.Router();

// Read routes (no audit) — more specific routes first
router.get("/suggest/:userId", controller.suggestMealPlans);
router.get("/health-condition/:userId/:healthCondition", controller.getMealPlansByHealthCondition);
router.get("/detail/:id", controller.getMealPlanById);
router.get("/:userId", controller.getUserMealPlans);

// Write routes (audit logged)
router.post("/", auditLogger, controller.createMealPlan);
router.put("/:id", auditLogger, controller.updateMealPlan);
router.delete("/:id", auditLogger, controller.deleteMealPlan);

export default router;
