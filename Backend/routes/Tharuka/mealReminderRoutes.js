import express from "express";
import * as controller from "../../controllers/Tharuka/mealReminderController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";
import { authenticate, isPatientOrCaregiver } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// Read routes (no audit)
router.get("/:userId", authenticate, controller.getUserReminders);

// Write routes (audit logged)
router.post("/generate/:userId", authenticate, isPatientOrCaregiver, auditLogger, controller.generateReminders);
router.put("/:id/complete", authenticate, isPatientOrCaregiver, auditLogger, controller.markReminderCompleted);
router.put("/:id/skip", authenticate, isPatientOrCaregiver, auditLogger, controller.markReminderSkipped);

export default router;
