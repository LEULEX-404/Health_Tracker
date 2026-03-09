import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllReadForUser,
  deleteNotification,
  clearAllNotifications
} from "../../controllers/Tharindu/notificationController.js";

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/user/:userId/read-all", markAllReadForUser);
router.delete("/:id", deleteNotification);
router.delete("/user/:userId", clearAllNotifications);

export default router;

