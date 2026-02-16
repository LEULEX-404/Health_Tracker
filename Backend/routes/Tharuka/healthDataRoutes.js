import express from "express";
import multer from "multer";
import path from "path";
const router = express.Router();
import controller from "../../controllers/Tharuka/healthDataController.js";
import auditLogger from "../../middleware/Tharuka/auditLogger.js";

// ─── Multer config for PDF uploads ───────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
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

// Get all records for a user
router.get("/:userId", controller.getUserData);

// Get single record
router.get("/record/:id", controller.getRecordById);

// Alert routes
router.get("/alerts/:userId", controller.getAlerts);
router.patch("/alerts/:alertId/resolve", controller.resolveAlert);

export default router;