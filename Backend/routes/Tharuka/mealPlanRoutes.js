import express from "express";
import * as controller from "../../controllers/Tharuka/mealPlanController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// Read routes (no audit) — more specific routes first
router.get("/suggest/:userId", authenticate, controller.suggestMealPlans);
router.get("/health-condition/:userId/:healthCondition", authenticate, controller.getMealPlansByHealthCondition);
router.get("/detail/:id", authenticate, controller.getMealPlanById);
router.get("/:userId", authenticate, controller.getUserMealPlans);

// Write routes (audit logged)
router.post("/", authenticate, auditLogger, controller.createMealPlan);
router.put("/:id", authenticate, auditLogger, controller.updateMealPlan);
router.delete("/:id", authenticate, auditLogger, controller.deleteMealPlan);

export default router;
