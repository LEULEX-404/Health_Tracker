import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const uploadsDir = path.join(path.dirname(path.dirname(__dirname)), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
import controller from "../../controllers/Tharuka/healthDataController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

// ─── Multer config for PDF uploads ───────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${uniqueSuffix}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ─── Routes ──────────────────────────────────────────────────

// Manual entry
router.post("/manual", auditLogger, controller.manualEntry);

// PDF upload
router.post(
  "/pdf-upload",
  auditLogger,
  upload.single("pdf"),
  controller.pdfUpload
);

// More specific routes first to avoid :userId capturing path segments
router.get("/record/:id", controller.getRecordById);
router.get("/alerts/:userId", controller.getAlerts);
router.patch("/alerts/:alertId/resolve", controller.resolveAlert);

// Get all records for a user (catch-all for single segment)
router.get("/:userId", controller.getUserData);

export default router;