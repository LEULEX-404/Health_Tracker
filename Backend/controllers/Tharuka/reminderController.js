import reminderService from "../../services/Tharuka/reminderService.js";

const ok = (res, data, meta = {}) => res.status(200).json({ success: true, ...meta, data });
const badRequest = (res, message) => res.status(400).json({ success: false, message });
const notFound = (res, message = "Not found") => res.status(404).json({ success: false, message });
const serverError = (res, message) => res.status(500).json({ success: false, message });

export const generateReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    const reminders = await reminderService.generateRemindersForActivePlans(userId);
    return ok(res, reminders, { message: `Generated ${reminders.length} reminders` });
  } catch (err) {
    console.error("generateReminders:", err.message);
    return serverError(res, err.message);
  }
};

export const getUserReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, startDate, endDate, limit, page } = req.query;
    const result = await reminderService.getUserReminders(userId, {
      status,
      startDate,
      endDate,
      limit,
      page,
    });
    return ok(res, result.reminders, { pagination: result.pagination });
  } catch (err) {
    console.error("getUserReminders:", err.message);
    return serverError(res, err.message);
  }
};

export const markReminderCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const reminder = await reminderService.markReminderCompleted(id, userId);
    if (!reminder) return notFound(res, "Reminder not found");
    return ok(res, reminder, { message: "Reminder marked as completed" });
  } catch (err) {
    console.error("markReminderCompleted:", err.message);
    return serverError(res, err.message);
  }
};

export const markReminderSkipped = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return badRequest(res, "userId is required");
    const reminder = await reminderService.markReminderSkipped(id, userId);
    if (!reminder) return notFound(res, "Reminder not found");
    return ok(res, reminder, { message: "Reminder marked as skipped" });
  } catch (err) {
    console.error("markReminderSkipped:", err.message);
    return serverError(res, err.message);
  }
};

export default {
  generateReminders,
  getUserReminders,
  markReminderCompleted,
  markReminderSkipped,
};
