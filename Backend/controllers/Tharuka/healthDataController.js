import healthDataService from "../../services/Tharuka/healthDataService.js";
import alertService from "../../services/Tharuka/alertService.js";

// ─── POST /api/health-data/manual ────────────────────────────
const manualEntry = async (req, res) => {
  try {
    const { userId, heartRate, bloodPressure, oxygenLevel, temperature, glucoseLevel } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    // At least one vital must be present
    if (
      heartRate === undefined &&
      bloodPressure === undefined &&
      oxygenLevel === undefined &&
      temperature === undefined &&
      glucoseLevel === undefined
    ) {
      return res.status(400).json({ success: false, message: "At least one vital sign is required" });
    }

    const { entry, alerts } = await healthDataService.saveManualEntry(userId, {
      heartRate,
      bloodPressure,
      oxygenLevel,
      temperature,
      glucoseLevel,
    });

    return res.status(201).json({
      success: true,
      message: "Health data saved successfully",
      data: {
        entry,
        alertsTriggered: alerts.length,
        alerts,
      },
    });
  } catch (error) {
    console.error("manualEntry error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/health-data/pdf-upload ────────────────────────
const pdfUpload = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const { entry, alerts, extractedText } = await healthDataService.savePdfEntry(userId, req.file);

    return res.status(201).json({
      success: true,
      message: "PDF processed and health data saved",
      data: {
        entry,
        alertsTriggered: alerts.length,
        alerts,
        extractedTextPreview: extractedText,
      },
    });
  } catch (error) {
    console.error("pdfUpload error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/health-data/:userId ────────────────────────────
const getUserData = async (req, res) => {
  try {
    const { userId }         = req.params;
    const { limit, source }  = req.query;

    const records = await healthDataService.getUserHealthData(userId, { limit, source });

    return res.status(200).json({
      success: true,
      count:   records.length,
      data:    records,
    });
  } catch (error) {
    console.error("getUserData error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/health-data/record/:id ─────────────────────────
const getRecordById = async (req, res) => {
  try {
    const record = await healthDataService.getHealthDataById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("getRecordById error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/health-data/alerts/:userId ─────────────────────
const getAlerts = async (req, res) => {
  try {
    const { userId }              = req.params;
    const { severity, resolved, limit } = req.query;

    const alerts = await alertService.getAlertHistory(userId, {
      severity, resolved, limit,
    });

    return res.status(200).json({
      success: true,
      count:   alerts.length,
      data:    alerts,
    });
  } catch (error) {
    console.error("getAlerts error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/health-data/alerts/:alertId/resolve ──────────
const resolveAlert = async (req, res) => {
  try {
    const updated = await alertService.resolveAlert(req.params.alertId);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Alert resolved",
      data:    updated,
    });
  } catch (error) {
    console.error("resolveAlert error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  manualEntry,
  pdfUpload,   
  getUserData,
  getRecordById,
  getAlerts,
  resolveAlert,
};