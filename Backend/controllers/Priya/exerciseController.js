import Exercise from "../../models/Priya/Exercise.js";

/** Date must be YYYY-MM-DD within current week (Mon–Sun) or next week. */
function isDateInAllowedRange(dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    const day = now.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    const startCurrentWeek = new Date(now);
    startCurrentWeek.setDate(now.getDate() + toMonday);
    startCurrentWeek.setHours(0, 0, 0, 0);
    const endNextWeek = new Date(startCurrentWeek);
    endNextWeek.setDate(startCurrentWeek.getDate() + 13);
    const t = d.getTime();
    return t >= startCurrentWeek.getTime() && t <= endNextWeek.getTime();
}

const getExerciseLogs = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
        const logs = await Exercise.find({ userId }).sort({ date: -1, createdAt: -1 });
        const formatted = logs.map(doc => {
            const o = doc.toObject();
            return { id: o._id.toString(), ...o };
        });
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch exercise logs.' });
    }
};

const createExerciseLog = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
        const { type, duration, calories, date } = req.body;
        if (!type || duration == null || calories == null || !date) {
            return res.status(400).json({ message: 'type, duration, calories and date are required.' });
        }
        if (!isDateInAllowedRange(date)) {
            return res.status(400).json({ message: 'Date must be within the current week or next week. Past dates are not allowed.' });
        }
        const log = await Exercise.create({
            userId,
            type: String(type).trim(),
            duration: parseInt(duration, 10) || 0,
            calories: parseInt(calories, 10) || 0,
            date: String(date).trim()
        });
        const o = log.toObject();
        res.status(201).json({ id: o._id.toString(), ...o });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create exercise log.' });
    }
};

const updateExerciseLog = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
        const { id } = req.params;
        const { type, duration, calories, date } = req.body;
        const update = {};
        if (type !== undefined) update.type = String(type).trim();
        if (duration !== undefined) update.duration = parseInt(duration, 10) || 0;
        if (calories !== undefined) update.calories = parseInt(calories, 10) || 0;
        if (date !== undefined) {
            const dateVal = String(date).trim();
            if (!isDateInAllowedRange(dateVal)) {
                return res.status(400).json({ message: 'Date must be within the current week or next week. Past dates are not allowed.' });
            }
            update.date = dateVal;
        }
        const log = await Exercise.findOneAndUpdate({ _id: id, userId }, update, { new: true });
        if (!log) return res.status(404).json({ message: 'Exercise log not found.' });
        const o = log.toObject();
        res.json({ id: o._id.toString(), ...o });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update exercise log.' });
    }
};

const deleteExerciseLog = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
        const { id } = req.params;
        const log = await Exercise.findOneAndDelete({ _id: id, userId });
        if (!log) return res.status(404).json({ message: 'Exercise log not found.' });
        res.json({ message: 'Exercise log deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete exercise log.' });
    }
};

const getStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
        const logs = await Exercise.find({ userId });
        const activeMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
        const caloriesBurned = logs.reduce((s, l) => s + (l.calories || 0), 0);
        res.json({
            activeMinutes,
            caloriesBurned,
            distanceKm: (activeMinutes * 0.1).toFixed(1),
            heartRate: 72,
            hydration: 1.8
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats.' });
    }
};

export default {
    getExerciseLogs,
    createExerciseLog,
    updateExerciseLog,
    deleteExerciseLog,
    getStats
}
