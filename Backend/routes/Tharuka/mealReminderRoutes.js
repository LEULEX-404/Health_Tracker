import express from "express";
import * as controller from "../../controllers/Tharuka/mealReminderController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

const router = express.Router();

// Read routes (no audit)
router.get("/:userId", controller.getUserReminders);

// Write routes (audit logged)
router.post("/generate/:userId", auditLogger, controller.generateReminders);
router.put("/:id/complete", auditLogger, controller.markReminderCompleted);
router.put("/:id/skip", auditLogger, controller.markReminderSkipped);

export default router;
