import { getOrCreateSettings, updateSettings } from "../../services/Tharindu/alertSettingsService.js";
import {
  canAccessUserScopedResource,
  rejectForbidden,
  resolveScopedUserId,
} from "../../middleware/Tharindu/accessControl.js";

export const getSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only view alert settings assigned to your account",
      );
    }

    const targetUserId = resolveScopedUserId(req.user, userId);
    const settings = await getOrCreateSettings(targetUserId);
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId && !canAccessUserScopedResource(req.user, userId)) {
      return rejectForbidden(
        res,
        "You can only update alert settings assigned to your account",
      );
    }

    const targetUserId = resolveScopedUserId(req.user, userId);
    const settings = await updateSettings(targetUserId, req.body);
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

