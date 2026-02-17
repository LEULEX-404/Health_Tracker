import express from "express";
const router     = express.Router();
import controller from "../../controllers/Tharuka/simulatorController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

// Single simulation
router.post("/simulator", auditLogger, controller.runSimulator);

// Bulk simulation (seed multiple readings at once)
router.post("/simulator/bulk", auditLogger, controller.bulkSimulate);

export default router;