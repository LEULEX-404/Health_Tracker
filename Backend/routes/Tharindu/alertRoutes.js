import express from "express";
import {
  generateAlert,
  getAlerts,
  getAlertById,
  updateStatus,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
  deleteAllAlerts,
} from "../../controllers/Tharindu/alertController.js";
import {
  authenticate,
  isAdmin,
} from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Alert lifecycle routes
router.post("/", generateAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.put("/:id", updateStatus);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.patch("/:id/resolve", resolveAlert);
router.delete("/all", isAdmin, deleteAllAlerts);
router.delete("/:id", isAdmin, deleteAlert);

export default router;
