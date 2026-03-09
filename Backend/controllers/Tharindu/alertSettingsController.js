import { getOrCreateSettings, updateSettings } from "../../services/Tharindu/alertSettingsService.js";

export const getSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await getOrCreateSettings(userId);
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await updateSettings(userId, req.body);
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

