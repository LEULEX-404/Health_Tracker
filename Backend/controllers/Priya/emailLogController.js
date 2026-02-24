import EmailLog from "../../models/Priya/EmailLog.js";

export const getEmailLogs = async (req, res) => {
    try {
        const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(200);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch email logs.' });
    }
};

export default {
    getEmailLogs
};
