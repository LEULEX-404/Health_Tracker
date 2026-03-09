import MealReminder from "../../models/Tharuka/MealReminder.js";
import MealPlan from "../../models/Tharuka/MealPlan.js";
import { sendMealReminderEmail } from "./emailService.js";

/**
 * NOTE:
 * This implementation assumes the server timezone is the same timezone
 * in which meal reminders should be interpreted.
 *
 * If you need true multi-timezone support, use a timezone-aware library
 * like Luxon or date-fns-tz and store a timezone per user/plan.
 */

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDayOfWeek(date) {
  return new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
}

function parseTime(timeString) {
  if (!timeString || typeof timeString !== "string") {
    throw new Error("Invalid scheduledTime");
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("scheduledTime must be in HH:mm format");
  }

  return { hours, minutes };
}

function buildScheduledDate(date) {
  const scheduledDate = new Date(date);
  scheduledDate.setHours(0, 0, 0, 0);
  return scheduledDate;
}

/**
 * Create reminder candidates for one meal plan within a date range.
 * The returned reminders are NOT yet inserted into the database.
 */
function createRemindersForPlan(mealPlan, rangeStart, rangeEnd, now = new Date()) {
  const reminders = [];

  const {
    userId,
    _id: mealPlanId,
    scheduledDays,
    scheduledTime,
    reminderMinutesBefore,
    reminderEnabled,
    mealType,
    mealName,
  } = mealPlan;

  if (
    !reminderEnabled ||
    !Array.isArray(scheduledDays) ||
    scheduledDays.length === 0 ||
    !scheduledTime
  ) {
    return reminders;
  }

  const { hours, minutes } = parseTime(scheduledTime);

  const cursor = startOfDay(rangeStart);
  const end = endOfDay(rangeEnd);

  while (cursor <= end) {
    const dayOfWeek = getDayOfWeek(cursor);

    if (scheduledDays.includes(dayOfWeek)) {
      const scheduledDate = buildScheduledDate(cursor);

      const mealDateTime = new Date(scheduledDate);
      mealDateTime.setHours(hours, minutes, 0, 0);

      const reminderTime = new Date(mealDateTime);
      reminderTime.setMinutes(
        reminderTime.getMinutes() - (mealPlan.reminderMinutesBefore ?? 15)
      );

      // Only create reminders for future-or-now delivery
      if (reminderTime >= now) {
        reminders.push({
          userId,
          mealPlanId,
          scheduledDate,
          reminderTime,
          mealType,
          mealName: mealName || "",
          status: "pending",
          notificationSent: false,
          retryCount: 0,
          lastError: null,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return reminders;
}

/**
 * Generate reminders for a user's active meal plans for the next 7 days.
 * Duplicate protection is enforced by a UNIQUE index on:
 *   { mealPlanId: 1, scheduledDate: 1 }
 */
async function generateRemindersForActivePlans(userId) {
  const now = new Date();
  const generationWindowEnd = endOfDay(addDays(now, 7));

  const activePlans = await MealPlan.find({
    userId,
    isActive: true,
    reminderEnabled: true,
    startDate: { $lte: generationWindowEnd },
    $or: [
      { endDate: null },
      { endDate: { $exists: false } },
      { endDate: { $gte: startOfDay(now) } },
    ],
  }).lean();

  if (!activePlans.length) {
    return [];
  }

  const allCandidates = [];

  for (const plan of activePlans) {
    const planStart = plan.startDate ? new Date(plan.startDate) : now;
    const planEnd = plan.endDate ? new Date(plan.endDate) : generationWindowEnd;

    // Effective range:
    // start at the later of now or plan.startDate
    // end at the earlier of generationWindowEnd or plan.endDate
    const effectiveStart = planStart > now ? planStart : now;
    const effectiveEnd = planEnd < generationWindowEnd ? planEnd : generationWindowEnd;

    if (effectiveStart > effectiveEnd) {
      continue;
    }

    const reminders = createRemindersForPlan(plan, effectiveStart, effectiveEnd, now);
    allCandidates.push(...reminders);
  }

  if (!allCandidates.length) {
    return [];
  }

  // Reduce duplicate attempts inside the same run before hitting DB
  const seen = new Set();
  const dedupedCandidates = allCandidates.filter((r) => {
    const key = `${r.mealPlanId.toString()}-${r.scheduledDate.toISOString()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  try {
    const insertedDocs = await MealReminder.insertMany(dedupedCandidates, {
      ordered: false,
    });

    console.log(
      `Meal reminder created: ${insertedDocs.length} reminder(s) generated for user ${userId}`
    );

    return insertedDocs.map((doc) => doc.toObject());
  } catch (error) {
    // Unordered insertMany may throw duplicate key errors if another process inserts
    // the same reminders concurrently. That is acceptable because the unique index
    // guarantees correctness.
    const writeErrors = error?.writeErrors || [];
    const hasNonDuplicateError = writeErrors.some(
      (e) => (e.code || e.err?.code) !== 11000
    );

    if (hasNonDuplicateError || (error.code !== 11000 && !writeErrors.length)) {
      throw error;
    }

    const insertedDocs = error?.insertedDocs || [];

    if (insertedDocs.length > 0) {
      console.log(
        `Meal reminder created: ${insertedDocs.length} reminder(s) generated for user ${userId}`
      );
    }

    return insertedDocs.map((doc) =>
      typeof doc.toObject === "function" ? doc.toObject() : doc
    );
  }
}

/**
 * Get reminders that are due to be sent.
 * We do NOT limit to only the last 12 hours, because that can permanently miss
 * old pending reminders if the worker was down.
 */
async function getPendingReminders(userId, limit = 50) {
  const now = new Date();
  const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 200);

  const query = {
    status: "pending",
    reminderTime: { $lte: now },
  };

  if (userId) {
    query.userId = userId;
  }

  return MealReminder.find(query)
    .sort({ reminderTime: 1 })
    .limit(safeLimit)
    .lean();
}

async function sendReminder(reminderId) {
  const reminder = await MealReminder.findById(reminderId).populate(
    "userId mealPlanId"
  );

  if (!reminder || reminder.status !== "pending") {
    return null;
  }

  const user = reminder.userId;
  const mealPlan = reminder.mealPlanId;

  if (!user || !mealPlan) {
    reminder.status = "cancelled";
    reminder.lastError = "Missing user or meal plan";
    await reminder.save();
    return null;
  }

  try {
    // Build the displayed meal time from scheduledDate + mealPlan.scheduledTime
    let scheduledTime = new Date(reminder.scheduledDate);

    if (mealPlan.scheduledTime) {
      const { hours, minutes } = parseTime(mealPlan.scheduledTime);
      scheduledTime.setHours(hours, minutes, 0, 0);
    }

    await sendMealReminderEmail(user.email, user.firstName, {
      mealName: mealPlan.mealName || mealPlan.mealType,
      mealType: mealPlan.mealType,
      scheduledTime,
      items: mealPlan.items || [],
    });

    reminder.status = "sent";
    reminder.notificationSent = true;
    reminder.sentAt = new Date();
    reminder.lastError = null;

    await reminder.save();

    console.log(
      `Meal reminder sent: Successfully sent Reminder ID ${reminderId} for user ${user._id}`
    );

    return reminder;
  } catch (error) {
    reminder.retryCount = (reminder.retryCount || 0) + 1;
    reminder.lastError = error.message || "Unknown send error";

    await reminder.save();

    console.error(`Failed to send reminder ${reminderId}:`, error.message);
    throw error;
  }
}

async function markReminderCompleted(reminderId, userId) {
  const reminder = await MealReminder.findOne({
    _id: reminderId,
    userId,
    status: { $in: ["pending", "sent"] },
  });

  if (!reminder) return null;

  reminder.status = "completed";
  reminder.completedAt = new Date();
  await reminder.save();

  return reminder;
}

async function markReminderSkipped(reminderId, userId) {
  const reminder = await MealReminder.findOne({
    _id: reminderId,
    userId,
    status: { $in: ["pending", "sent"] },
  });

  if (!reminder) return null;

  reminder.status = "skipped";
  await reminder.save();

  return reminder;
}

async function getUserReminders(userId, options = {}) {
  const { status, startDate, endDate, limit = 50, page = 1 } = options;

  const query = { userId };

  if (status) {
    query.status = status;
  }

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
      .populate("mealPlanId", "planName mealType mealName items scheduledTime")
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
