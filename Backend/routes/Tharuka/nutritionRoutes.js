import express from "express";
import * as controller from "../../controllers/Tharuka/nutritionController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

const router = express.Router();

// Base path — guide user to correct endpoint
router.get("/", (req, res) => {
  res.status(400).json({
    success: false,
    message: "userId is required. Use GET /api/nutrition/:userId",
  });
});

// Read (no audit for GETs)
router.get("/analysis/:userId", controller.getNutritionAnalysis);
router.get("/:userId", controller.getUserNutrition);

// Write (audit logged)
router.post("/", auditLogger, controller.addMeal);
router.put("/:id", auditLogger, controller.updateMeal);
router.delete("/:id", auditLogger, controller.deleteMeal);
router.post("/:id/recommendation", auditLogger, controller.addDoctorRecommendation);

export default router;
