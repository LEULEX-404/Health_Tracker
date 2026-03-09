import Alert from "../../models/Tharindu/Alert.js";
import { createAlert } from "../../services/Tharindu/alertService.js";
import { notifyOnAlertResolved } from "../../services/Tharindu/notificationService.js";

// POST - Create Alert (manual)
export const generateAlert = async (req, res) => {
  try {
    const { userId, patientId, parameter, value } = req.body;

    const effectiveUserId = userId || patientId;
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

    if (userId) query.userId = userId;
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
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE status (generic)
export const updateStatus = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Not found" });
    }

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
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.status = "Acknowledged";
    alert.acknowledgedBy = doctorId || alert.acknowledgedBy;

    await alert.save();

    return res.status(200).json(alert);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// RESOLVE alert
export const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

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
    await Alert.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

