import HealthData from "../../models/Tharuka/HealthData.js";
import alertService from "../../services/Tharuka/alertService.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
import fs from "fs";

// ─── Manual Entry ─────────────────────────────────────────────
const saveManualEntry = async (userId, vitals) => {
  const entry = await HealthData.create({
    userId,
    ...vitals,
    source: "manual",
    recordedAt: new Date(),
  });

  // Auto-trigger alert analysis
  const alerts = await alertService.analyzeAndCreateAlerts(entry);
  return { entry, alerts };
};

// ─── PDF Upload ───────────────────────────────────────────────
const savePdfEntry = async (userId, file) => {
  // Read uploaded file buffer for parsing (pdf-parse v2 API)
  const dataBuffer = fs.readFileSync(file.path);
  const parser = new PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();
  const rawText = textResult.text || "";

  // Naive regex extractors — adjust patterns to match your real PDFs
  const extract = (pattern) => {
    const match = rawText.match(pattern);
    return match ? parseFloat(match[1]) : undefined;
  };

  const vitals = {
    heartRate:    extract(/heart\s*rate[:\s]+(\d+(\.\d+)?)/i),
    oxygenLevel:  extract(/(?:spo2|oxygen)[:\s]+(\d+(\.\d+)?)/i),
    glucoseLevel: extract(/glucose[:\s]+(\d+(\.\d+)?)/i),
    temperature:  extract(/temp(?:erature)?[:\s]+(\d+(\.\d+)?)/i),
  };

  // Blood pressure: e.g. "120/80"
  const bpMatch = rawText.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (bpMatch) {
    vitals.bloodPressure = {
      systolic:  parseInt(bpMatch[1]),
      diastolic: parseInt(bpMatch[2]),
    };
  }

  // Metadata extraction
  const metadata = {
    reportName:   (rawText.match(/report(?:\s+name)?[:\s]+([^\n]+)/i) || [])[1]?.trim(),
    hospitalName: (rawText.match(/hospital[:\s]+([^\n]+)/i)           || [])[1]?.trim(),
    doctorName:   (rawText.match(/(?:dr\.?|doctor)[:\s]+([^\n]+)/i)   || [])[1]?.trim(),
    extractedAt:  new Date(),
  };

  const entry = await HealthData.create({
    userId,
    ...vitals,
    source:      "pdf",
    pdfFilePath: file.path,
    metadata,
    recordedAt:  new Date(),
  });

  const alerts = await alertService.analyzeAndCreateAlerts(entry);
  return { entry, alerts, extractedText: rawText.substring(0, 500) };
};

// ─── Get Recent Records ───────────────────────────────────────
const getUserHealthData = async (userId, { limit = 20, source } = {}) => {
  const query = { userId };
  if (source) query.source = source;

  return HealthData.find(query)
    .sort({ recordedAt: -1 })
    .limit(Number(limit));
};

// ─── Get Single Record ────────────────────────────────────────
const getHealthDataById = async (id) => {
  return HealthData.findById(id);
};

export default {
  saveManualEntry,
  savePdfEntry,
  getUserHealthData,
  getHealthDataById,
};