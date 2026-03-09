import express from "express";
import * as controller from "../../controllers/Tharuka/nutritionController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";
import { authenticate, isDoctor } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// Base path — guide user to correct endpoint
router.get("/", (req, res) => {
  res.status(400).json({
    success: false,
    message: "userId is required. Use GET /api/nutrition/:userId",
  });
});

// Read (no audit for GETs)
router.get("/analysis/:userId", authenticate, controller.getNutritionAnalysis);
router.get("/:userId", authenticate, controller.getUserNutrition);

// Write (audit logged)
router.post("/", authenticate, auditLogger, controller.addMeal);
router.put("/:id", authenticate, auditLogger, controller.updateMeal);
router.delete("/:id", authenticate, auditLogger, controller.deleteMeal);
router.post("/:id/recommendation", authenticate, isDoctor, auditLogger, controller.addDoctorRecommendation);

export default router;
