import express from "express";
const router = express.Router();
import emailLogController from "../../controllers/Priya/emailLogController.js";

router.get('/', emailLogController.getEmailLogs);

export default router;
