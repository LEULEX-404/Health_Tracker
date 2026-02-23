import AlertHistory from "../../models/Tharuka/AlertHistory.js";

// ─── Thresholds ───────────────────────────────────────────────
const THRESHOLDS = {
  heartRate:    { high: 120, critical: 150, low: 40 },
  oxygenLevel:  { low: 90, critical: 85 },
  glucoseLevel: { high: 200, critical: 400 },
  bloodPressure: { systolicHigh: 140, diastolicHigh: 90, systolicCritical: 180, diastolicCritical: 120 },
  temperature:  { high: 38.5, critical: 40 },
};

/**
 * Analyses a saved HealthData document and creates AlertHistory
 * records for any readings that exceed thresholds.
 * Returns array of created alert docs.
 */
const analyzeAndCreateAlerts = async (healthData) => {
  const alerts = [];
  const { userId, _id: healthDataId } = healthData;

  // 1. Heart Rate
  if (healthData.heartRate !== undefined) {
    if (healthData.heartRate > THRESHOLDS.heartRate.critical) {
      alerts.push({
        userId, healthDataId,
        alertType: "high_heart_rate",
        severity:  "critical",
        message:   `Critical heart rate: ${healthData.heartRate} bpm`,
      });
    } else if (healthData.heartRate > THRESHOLDS.heartRate.high) {
      alerts.push({
        userId, healthDataId,
        alertType: "high_heart_rate",
        severity:  "high",
        message:   `High heart rate: ${healthData.heartRate} bpm`,
      });
    }
  }

  // 2. Oxygen Level
  if (healthData.oxygenLevel !== undefined) {
    if (healthData.oxygenLevel < THRESHOLDS.oxygenLevel.low) {
      alerts.push({
        userId, healthDataId,
        alertType: "low_oxygen",
        severity:  healthData.oxygenLevel < THRESHOLDS.oxygenLevel.critical ? "critical" : "high",
        message:   `Low oxygen level: ${healthData.oxygenLevel}%`,
      });
    }
  }

  // 3. Glucose
  if (healthData.glucoseLevel !== undefined) {
    if (healthData.glucoseLevel > THRESHOLDS.glucoseLevel.critical) {
      alerts.push({
        userId, healthDataId,
        alertType: "high_glucose",
        severity:  "critical",
        message:   `Critical glucose level: ${healthData.glucoseLevel} mg/dL`,
      });
    } else if (healthData.glucoseLevel > THRESHOLDS.glucoseLevel.high) {
      alerts.push({
        userId, healthDataId,
        alertType: "high_glucose",
        severity:  "high",
        message:   `High glucose level: ${healthData.glucoseLevel} mg/dL`,
      });
    }
  }

  // 4. Blood Pressure
  if (healthData.bloodPressure) {
    const { systolic, diastolic } = healthData.bloodPressure;
    if (systolic != null && diastolic != null) {
      if (systolic > THRESHOLDS.bloodPressure.systolicCritical || diastolic > THRESHOLDS.bloodPressure.diastolicCritical) {
        alerts.push({
        userId, healthDataId,
        alertType: "high_bp",
        severity:  "critical",
        message:   `Hypertensive crisis: ${systolic}/${diastolic} mmHg`,
        });
      } else if (systolic > THRESHOLDS.bloodPressure.systolicHigh || diastolic > THRESHOLDS.bloodPressure.diastolicHigh) {
        alerts.push({
          userId, healthDataId,
          alertType: "high_bp",
          severity:  "high",
          message:   `High blood pressure: ${systolic}/${diastolic} mmHg`,
        });
      }
    }
  }

  // 5. Temperature
  if (healthData.temperature !== undefined) {
    if (healthData.temperature >= THRESHOLDS.temperature.critical) {
      alerts.push({
        userId, healthDataId,
        alertType: "temperature_spike",
        severity:  "critical",
        message:   `Critical temperature: ${healthData.temperature}°C`,
      });
    } else if (healthData.temperature >= THRESHOLDS.temperature.high) {
      alerts.push({
        userId, healthDataId,
        alertType: "temperature_spike",
        severity:  "high",
        message:   `High temperature (fever): ${healthData.temperature}°C`,
      });
    }
  }

  // Persist all generated alerts
  if (alerts.length > 0) {
    const saved = await AlertHistory.insertMany(alerts);
    return saved;
  }
  return [];
};

/**
 * Fetch alert history for a user with optional filters.
 */
const getAlertHistory = async (userId, { severity, resolved, limit = 50 } = {}) => {
  const query = { userId };
  if (severity)              query.severity = severity;
  if (resolved !== undefined) query.resolved = resolved === "true";

  return AlertHistory.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("healthDataId", "heartRate oxygenLevel bloodPressure recordedAt");
};

/**
 * Mark an alert as resolved.
 */
const resolveAlert = async (alertId) => {
  return AlertHistory.findByIdAndUpdate(
    alertId,
    { resolved: true, resolvedAt: new Date() },
    { new: true }
  );
};

export default {
  analyzeAndCreateAlerts,
  getAlertHistory,
  resolveAlert,
};
