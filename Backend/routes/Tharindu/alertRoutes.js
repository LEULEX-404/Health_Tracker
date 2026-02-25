import express from "express";
import {
  generateAlert,
  getAlerts,
  getAlertById,
  updateStatus,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
} from "../../controllers/Tharindu/alertController.js";

const router = express.Router();

// Alert lifecycle routes
router.post("/", generateAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.put("/:id", updateStatus);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.patch("/:id/resolve", resolveAlert);
router.delete("/:id", deleteAlert);

export default router;
