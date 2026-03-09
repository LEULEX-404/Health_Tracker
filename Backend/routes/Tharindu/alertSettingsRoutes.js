import express from "express";
import {
  getSettings,
  upsertSettings,
} from "../../controllers/Tharindu/alertSettingsController.js";

const router = express.Router();

router.get("/:userId", getSettings);
router.put("/:userId", upsertSettings);

export default router;

