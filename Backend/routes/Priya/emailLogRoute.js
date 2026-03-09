import express from "express";
const router = express.Router();
import emailLogController from "../../controllers/Priya/emailLogController.js";
import { authenticate, isAdmin } from '../../middleware/Imasha/authMiddleware.js';

router.get('/', authenticate, isAdmin, emailLogController.getEmailLogs);

export default router;
