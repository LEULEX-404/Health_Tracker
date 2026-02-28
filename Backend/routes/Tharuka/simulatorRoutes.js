import express from "express";
const router     = express.Router();
import controller from "../../controllers/Tharuka/simulatorController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";
import { authenticate, isPatientOrCaregiver } from "../../middleware/Imasha/authMiddleware.js";

// Single simulation
router.post("/simulator", authenticate, isPatientOrCaregiver, auditLogger, controller.runSimulator);

// Bulk simulation (seed multiple readings at once)
router.post("/simulator/bulk", authenticate, isPatientOrCaregiver, auditLogger, controller.bulkSimulate);

export default router;