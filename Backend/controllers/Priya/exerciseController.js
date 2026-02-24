import Exercise from "../../models/Priya/Exercise.js";

const getExerciseLogs = async (req, res) => {
    try {
        const logs = await Exercise.find().sort({ date: -1, createdAt: -1 });
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
        const { type, duration, calories, date } = req.body;
        if (!type || duration == null || calories == null || !date) {
            return res.status(400).json({ message: 'type, duration, calories and date are required.' });
        }
        const log = await Exercise.create({
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
        const { id } = req.params;
        const { type, duration, calories, date } = req.body;
        const update = {};
        if (type !== undefined) update.type = String(type).trim();
        if (duration !== undefined) update.duration = parseInt(duration, 10) || 0;
        if (calories !== undefined) update.calories = parseInt(calories, 10) || 0;
        if (date !== undefined) update.date = String(date).trim();
        const log = await Exercise.findByIdAndUpdate(id, update, { new: true });
        if (!log) return res.status(404).json({ message: 'Exercise log not found.' });
        const o = log.toObject();
        res.json({ id: o._id.toString(), ...o });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update exercise log.' });
    }
};

const deleteExerciseLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Exercise.findByIdAndDelete(id);
        if (!log) return res.status(404).json({ message: 'Exercise log not found.' });
        res.json({ message: 'Exercise log deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete exercise log.' });
    }
};

const getStats = async (req, res) => {
    try {
        const logs = await Exercise.find();
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
