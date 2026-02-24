/*    TO DO:
1. Receive health data
2. Get threshold from DB
3. Compare values
4. Determine severity
5. Create alert if abnormal
6. Trigger notification
*/

import Alert from "../../models/Tharindu/Alert.js";
import Threshold from "../../models/Tharindu/Threshold.js";
import AlertSettings from "../../models/Tharindu/AlertSettings.js";
import User from "../../models/Imasha/User.js";
import {
  notifyOnNewAlert,
  notifyOnEscalationCandidate,
} from "./notificationService.js";

export const getUserContact = async (userId) => {
  const user = await User.findById(userId).select("email phone text");
  return user || {};
};


//for red light green light seen ekat (check with threashold value eka compare karanwa)

const determineSeverity = (parameter, value, min, max) => {
  if (value < min || value > max) {
    const difference = value > max ? value - max : min - value;

    // Parameter-specific scaling for severity
    if (parameter === "temperature" || parameter === "oxygenLevel") {
      // For these, even 2-5 degree/percent difference is High/Critical
      if (difference > 5) return "Critical";
      if (difference > 2) return "High";
      if (difference > 1) return "Medium";
      return "Low";
    }

    if (difference > 40) return "Critical";
    if (difference > 25) return "High";
    if (difference > 10) return "Medium";
    return "Low";
  }
  return null;
};

const RECENT_WINDOW_MINUTES = 15;
const REPEAT_THRESHOLD_COUNT = 3;

export const createAlert = async (userId, parameter, value) => {
  let min = null;
  let max = null;

  const threshold = await Threshold.findOne({ parameter });

  if (threshold) {
    min = threshold.minValue;
    max = threshold.maxValue;
  } else {
    // Fallback to user-level AlertSettings
    const settings = await AlertSettings.findOne({ userId });

    if (settings) {
      if (parameter === "heartRate" && settings.heartRateMax != null) {
        min = 0;
        max = settings.heartRateMax;
      } else if (parameter === "oxygenLevel" && settings.oxygenMin != null) {
        min = settings.oxygenMin;
        max = 100;
      } else if (parameter === "glucoseLevel" && settings.glucoseMax != null) {
        min = 0;
        max = settings.glucoseMax;
      }
    }
  }

  // --- DEFAULT THRESHOLDS (IF DB IS EMPTY) ---
  if (min == null || max == null) {
    if (parameter === "heartRate") { min = 40; max = 120; }
    else if (parameter === "oxygenLevel") { min = 90; max = 100; }
    else if (parameter === "glucoseLevel") { min = 70; max = 200; }
    else if (parameter === "bloodPressure") { min = 0; max = 140; } // systolic
    else if (parameter === "temperature") { min = 36; max = 38; }
  }

  // If we still don't have bounds, treat as "no rule" -> no alert
  if (min == null || max == null) {
    console.log(`[Tharindu] No threshold found for ${parameter}, skipping...`);
    return null;
  }


  const severity = determineSeverity(parameter, value, min, max);


  if (!severity) return null; // Normal value

  const alert = await Alert.create({
    userId,
    parameter,
    value,
    minThreshold: min,
    maxThreshold: max,
    severity,
    triggeredAt: new Date(),
  });

  // Detect repeated abnormal readings for escalation
  const since = new Date(Date.now() - RECENT_WINDOW_MINUTES * 60 * 1000);
  const recentCount = await Alert.countDocuments({
    userId,
    parameter,
    createdAt: { $gte: since },
  });

  // Convert to plain object so we can add non-schema properties (email, phone)
  const alertData = alert.toObject();
  const { email, phone } = await getUserContact(userId);
  alertData.userEmail = email;
  alertData.userPhone = phone;

  if (recentCount >= REPEAT_THRESHOLD_COUNT && !alert.isEmergency) {
    alert.isEmergency = true;
    await alert.save();
    alertData.isEmergency = true;
    await notifyOnEscalationCandidate(alertData);
  } else {
    await notifyOnNewAlert(alertData);
  }

  return alert;
};

/**
 * Real-time monitoring engine:
 * Analyze incoming health data document and generate alerts per vital.
 */
export const analyzeHealthData = async (healthData) => {
  const userId = healthData.userId?.toString();
  const alerts = [];

  if (!userId) return { alerts: [] };

  const {
    heartRate,
    bloodPressure,
    oxygenLevel,
    temperature,
    glucoseLevel,
  } = healthData;

  if (heartRate !== undefined) {
    const alert = await createAlert(userId, "heartRate", heartRate);
    if (alert) alerts.push(alert);
  }

  if (bloodPressure && bloodPressure.systolic != null) {
    const alert = await createAlert(
      userId,
      "bloodPressure",
      bloodPressure.systolic,
    );
    if (alert) alerts.push(alert);
  }

  if (oxygenLevel !== undefined) {
    const alert = await createAlert(userId, "oxygenLevel", oxygenLevel);
    if (alert) alerts.push(alert);
  }

  if (temperature !== undefined) {
    const alert = await createAlert(userId, "temperature", temperature);
    if (alert) alerts.push(alert);
  }

  if (glucoseLevel !== undefined) {
    const alert = await createAlert(userId, "glucoseLevel", glucoseLevel);
    if (alert) alerts.push(alert);
  }

  if (alerts.length > 0) {
    console.log(`[Tharindu] 🚨 Generated ${alerts.length} alerts for user ${userId}`);
  } else {
    console.log(`[Tharindu] ✅ Health data analyzed, no alerts for user ${userId}`);
  }

  return { alerts };
};


