import Alert from "../../models/Tharindu/Alert.js";
import { createAlert } from "../../services/Tharindu/alertService.js";
import { notifyOnAlertResolved } from "../../services/Tharindu/notificationService.js";
import {
  canAccessUserScopedResource,
  hasElevatedMonitoringAccess,
  rejectForbidden,
  resolveScopedUserId,
} from "../../middleware/Tharindu/accessControl.js";

const getAccessibleAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    res.status(404).json({ message: "Alert not found" });
    return null;
  }

  if (!canAccessUserScopedResource(req.user, alert.userId)) {
    rejectForbidden(res, "You can only access alerts assigned to your account");
    return null;
  }

  return alert;
};

// POST - Create Alert (manual)
export const generateAlert = async (req, res) => {
  try {
    const { userId, patientId, parameter, value } = req.body;
    const requestedUserId = userId || patientId;

    if (
      requestedUserId &&
      !canAccessUserScopedResource(req.user, requestedUserId)
    ) {
      return rejectForbidden(
        res,
        "You can only create alerts for your own account",
      );
    }

    const effectiveUserId = resolveScopedUserId(req.user, requestedUserId);
    if (!effectiveUserId) {
      return res
        .status(400)
        .json({ error: "userId (or patientId) is required" });
    }

    const alert = await createAlert(effectiveUserId, parameter, value);

    if (!alert) {
      return res.status(200).json({ message: "Values normal" });
    }

    return res.status(201).json(alert);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// GET all alerts (with optional filters)
export const getAlerts = async (req, res) => {
  try {
    const { userId, status, severity } = req.query;
    const query = {};

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only view alerts assigned to your account",
      );
    }

    if (userId || !hasElevatedMonitoringAccess(req.user)) {
      query.userId = resolveScopedUserId(req.user, userId);
    }
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query).sort({ triggeredAt: -1 });
    return res.status(200).json(alerts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET single alert
export const getAlertById = async (req, res) => {
  try {
    const alert = await getAccessibleAlert(req, res);
    if (!alert) return;

    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE status (generic)
export const updateStatus = async (req, res) => {
  try {
    const alert = await getAccessibleAlert(req, res);
    if (!alert) return;

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    alert.status = status;

    if (status === "Resolved") {
      alert.resolvedAt = new Date();
      await notifyOnAlertResolved(alert);
    }

    await alert.save();

    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ACKNOWLEDGE alert (doctor)
export const acknowledgeAlert = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const alert = await getAccessibleAlert(req, res);
    if (!alert) return;

    alert.status = "Acknowledged";
    alert.acknowledgedBy =
      hasElevatedMonitoringAccess(req.user) && doctorId
        ? doctorId
        : req.user._id;

    await alert.save();

    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// RESOLVE alert
export const resolveAlert = async (req, res) => {
  try {
    const alert = await getAccessibleAlert(req, res);
    if (!alert) return;

    alert.status = "Resolved";
    alert.resolvedAt = new Date();

    await alert.save();
    await notifyOnAlertResolved(alert);

    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE alert
export const deleteAlert = async (req, res) => {
  try {
    const deletedAlert = await Alert.findByIdAndDelete(req.params.id);

    if (!deletedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE ALL alerts
export const deleteAllAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    return res.status(200).json({ message: "All alerts deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

