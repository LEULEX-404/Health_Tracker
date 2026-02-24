import AlertSettings from "../../models/Tharindu/AlertSettings.js";

export const getOrCreateSettings = async (userId) => {
  let settings = await AlertSettings.findOne({ userId });
  if (!settings) {
    settings = await AlertSettings.create({ userId });
  }
  return settings;
};

export const updateSettings = async (userId, payload) => {
  const allowedFields = [
    "heartRateMax",
    "oxygenMin",
    "glucoseMax",
    "escalationTimeMinutes",
    "smsEnabled",
    "emailEnabled",
  ];

  const update = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) {
      update[key] = payload[key];
    }
  }

  const settings = await AlertSettings.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true, upsert: true },
  );

  return settings;
};

