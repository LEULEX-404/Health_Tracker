import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllReadForUser,
  deleteNotification,
  clearAllNotifications
} from "../../controllers/Tharindu/notificationController.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/:userId", getUserNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/user/:userId/read-all", markAllReadForUser);
router.delete("/:id", deleteNotification);
router.delete("/user/:userId", clearAllNotifications);

export default router;

