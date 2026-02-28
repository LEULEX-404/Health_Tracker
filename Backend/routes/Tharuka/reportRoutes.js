import express from "express";
const router     = express.Router();
import controller from "../../controllers/Tharuka/reportController.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

router.get("/weekly/:userId", authenticate, controller.weeklyReport);
router.get("/monthly/:userId", authenticate, controller.monthlyReport);
router.get("/export/pdf/:userId", authenticate, controller.exportPdf);

export default router;