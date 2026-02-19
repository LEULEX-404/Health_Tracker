import MealReminder from "../../models/Tharuka/MealReminder.js";
import MealPlan from "../../models/Tharuka/MealPlan.js";
import User from "../../models/Imasha/User.js";
import { sendMealReminderEmail } from "./emailService.js";

function getDayOfWeek(date) {
  return date.getDay();
}

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

function createRemindersForPlan(mealPlan, startDate, endDate) {
  const reminders = [];
  const { scheduledDays, scheduledTime, reminderMinutesBefore, reminderEnabled } = mealPlan;

  if (!reminderEnabled || !scheduledDays.length || !scheduledTime) {
    return reminders;
  }

  const { hours, minutes } = parseTime(scheduledTime);
  const currentDate = new Date(startDate);
  const end = new Date(endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  while (currentDate <= end) {
    const dayOfWeek = getDayOfWeek(currentDate);

    if (scheduledDays.includes(dayOfWeek)) {
      const reminderTime = new Date(currentDate);
      reminderTime.setHours(hours, minutes, 0, 0);

      const actualReminderTime = new Date(reminderTime);
      actualReminderTime.setMinutes(actualReminderTime.getMinutes() - reminderMinutesBefore);

      if (actualReminderTime >= new Date()) {
        reminders.push({
          userId: mealPlan.userId,
          mealPlanId: mealPlan._id,
          scheduledDate: new Date(currentDate),
          reminderTime: actualReminderTime,
          mealType: mealPlan.mealType,
          mealName: mealPlan.mealName,
          status: "pending",
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return reminders;
}

async function generateRemindersForActivePlans(userId) {
  const activePlans = await MealPlan.find({
    userId,
    isActive: true,
    reminderEnabled: true,
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    startDate: { $lte: new Date() },
  }).lean();

  const allReminders = [];
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  for (const plan of activePlans) {
    const reminders = createRemindersForPlan(plan, now, futureDate);
    allReminders.push(...reminders);
  }

  if (allReminders.length === 0) return [];

  const existingReminders = await MealReminder.find({
    userId,
    reminderTime: { $gte: now, $lte: futureDate },
    status: { $in: ["pending", "sent"] },
  }).lean();

  const existingKeys = new Set(
    existingReminders.map(
      (r) => `${r.mealPlanId}-${r.scheduledDate.toISOString().split("T")[0]}`
    )
  );

  const newReminders = allReminders.filter(
    (r) => !existingKeys.has(`${r.mealPlanId}-${r.scheduledDate.toISOString().split("T")[0]}`)
  );

  if (newReminders.length > 0) {
    await MealReminder.insertMany(newReminders);
  }

  return newReminders;
}

async function getPendingReminders(userId, limit = 50) {
  const now = new Date();
  const reminders = await MealReminder.find({
    userId,
    status: "pending",
    reminderTime: { $lte: now },
  })
    .sort({ reminderTime: 1 })
    .limit(limit)
    .lean();

  return reminders;
}

async function sendReminder(reminderId) {
  const reminder = await MealReminder.findById(reminderId).populate("userId mealPlanId");
  if (!reminder || reminder.status !== "pending") {
    return null;
  }

  const user = reminder.userId;
  const mealPlan = reminder.mealPlanId;

  if (!user || !mealPlan) {
    return null;
  }

  try {
    await sendMealReminderEmail(
      user.email,
      user.firstName,
      {
        mealName: mealPlan.mealName || mealPlan.mealType,
        mealType: mealPlan.mealType,
        scheduledTime: reminder.scheduledDate,
        items: mealPlan.items,
      }
    );

    reminder.status = "sent";
    reminder.notificationSent = true;
    reminder.sentAt = new Date();
    await reminder.save();

    return reminder;
  } catch (error) {
    console.error(`Failed to send reminder ${reminderId}:`, error.message);
    throw error;
  }
}

async function markReminderCompleted(reminderId, userId) {
  const reminder = await MealReminder.findOne({ _id: reminderId, userId });
  if (!reminder) return null;

  reminder.status = "completed";
  reminder.completedAt = new Date();
  await reminder.save();

  return reminder;
}

async function markReminderSkipped(reminderId, userId) {
  const reminder = await MealReminder.findOne({ _id: reminderId, userId });
  if (!reminder) return null;

  reminder.status = "skipped";
  await reminder.save();

  return reminder;
}

async function getUserReminders(userId, options = {}) {
  const { status, startDate, endDate, limit = 50, page = 1 } = options;
  const query = { userId };

  if (status) query.status = status;
  if (startDate || endDate) {
    query.reminderTime = {};
    if (startDate) query.reminderTime.$gte = new Date(startDate);
    if (endDate) query.reminderTime.$lte = new Date(endDate);
  }

  const limitNum = Math.min(Math.max(1, Number(limit) || 50), 100);
  const pageNum = Math.max(1, Number(page) || 1);
  const skip = (pageNum - 1) * limitNum;

  const [reminders, total] = await Promise.all([
    MealReminder.find(query)
      .populate("mealPlanId", "planName mealType mealName items")
      .sort({ reminderTime: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MealReminder.countDocuments(query),
  ]);

  return {
    reminders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export default {
  generateRemindersForActivePlans,
  getPendingReminders,
  sendReminder,
  markReminderCompleted,
  markReminderSkipped,
  getUserReminders,
  createRemindersForPlan,
};
