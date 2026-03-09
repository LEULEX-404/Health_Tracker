import Alert from "../../models/Tharindu/Alert.js";
import AlertSettings from "../../models/Tharindu/AlertSettings.js";
import { sendNotification } from "./notificationService.js";
import { getUserContact } from "./alertService.js";

const DEFAULT_ESCALATION_MINUTES = 10;

export const runEscalationScan = async () => {
  const now = new Date();

  // Find critical alerts that are still New and older than their escalation window
  const criticalAlerts = await Alert.find({
    severity: "Critical",
    status: "New",
    isEmergency: false,
  });

  for (const alert of criticalAlerts) {
    const settings =
      (await AlertSettings.findOne({ userId: alert.userId })) || {};

    const escalationMinutes =
      settings.escalationTimeMinutes || DEFAULT_ESCALATION_MINUTES;

    const thresholdTime = new Date(
      alert.triggeredAt.getTime() + escalationMinutes * 60 * 1000,
    );

    if (thresholdTime <= now) {
      alert.isEmergency = true;
      await alert.save();

      const { email, phone } = await getUserContact(alert.userId);

      const message = `🚨 Emergency escalation for ${alert.parameter
        }: value ${alert.value} (triggered at ${alert.triggeredAt.toISOString()}) has not been acknowledged.`;

      console.log(`[Escalation] 🚩 Escalating alert ${alert._id} for user ${alert.userId}. Target Email: ${email || "N/A"}`);

      await sendNotification(alert.userId, "sms", message, {
        alertId: alert._id,
        userPhone: phone,
      });
      await sendNotification(alert.userId, "email", message, {
        alertId: alert._id,
        userEmail: email,
        alertInfo: alert.toObject(),
      });
    }
  }
};

