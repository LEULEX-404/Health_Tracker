import Notification from "../../models/Tharindu/Notification.js";
import {
  canAccessUserScopedResource,
  rejectForbidden,
  resolveScopedUserId,
} from "../../middleware/Tharindu/accessControl.js";

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isRead, limit = 50 } = req.query;

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only view notifications assigned to your account",
      );
    }

    const query = { userId: resolveScopedUserId(req.user, userId) };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!canAccessUserScopedResource(req.user, notification.userId)) {
      return rejectForbidden(
        res,
        "You can only update notifications assigned to your account",
      );
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    return res.status(200).json(updatedNotification);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAllReadForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only update notifications assigned to your account",
      );
    }

    const targetUserId = resolveScopedUserId(req.user, userId);
    await Notification.updateMany(
      { userId: targetUserId, isRead: false },
      { isRead: true },
    );
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!canAccessUserScopedResource(req.user, notification.userId)) {
      return rejectForbidden(
        res,
        "You can only delete notifications assigned to your account",
      );
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only clear notifications assigned to your account",
      );
    }

    const targetUserId = resolveScopedUserId(req.user, userId);
    await Notification.deleteMany({ userId: targetUserId });
    return res.status(200).json({ message: "All notifications cleared" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

