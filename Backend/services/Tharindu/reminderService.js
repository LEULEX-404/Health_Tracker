// Appointment reminder scheduler (Node Cron)

import cron from "node-cron";
import Reminder from "../../models/Tharindu/Reminder.js";
import { sendNotification } from "./notificationService.js";

const processDueReminders = async () => {
  const now = new Date();

  const reminders = await Reminder.find({
    appointmentTime: { $lte: now },
    isSent: false,
  });

  for (const reminder of reminders) {
    const message =
      reminder.message ||
      "You have an upcoming health appointment. Please check your schedule.";

    await sendNotification(reminder.patientId, "inApp", message, {
      reminderId: reminder._id,
    });

    reminder.isSent = true;
    await reminder.save();
  }
};

// Runs every minute
cron.schedule("* * * * *", processDueReminders);

export default {
  processDueReminders,
};

