import express from "express";
import {
  getSettings,
  upsertSettings,
} from "../../controllers/Tharindu/alertSettingsController.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/:userId", getSettings);
router.put("/:userId", upsertSettings);

export default router;

