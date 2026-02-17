import express from "express";
const router     = express.Router();
import controller from "../../controllers/Tharuka/reportController.js";

router.get("/weekly/:userId", controller.weeklyReport);
router.get("/monthly/:userId", controller.monthlyReport);
router.get("/export/pdf/:userId", controller.exportPdf);

export default router;