import HealthData from "../../models/Tharuka/HealthData.js";
import AlertHistory from "../../models/Tharuka/AlertHistory.js";
import PDFDocument from "pdfkit";

// ─── Date Helpers ─────────────────────────────────────────────
const getDateRange = (type) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  if (type === "weekly") {
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (type === "monthly") {
    start.setMonth(end.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
};

// ─── Aggregate Vitals Stats ───────────────────────────────────
const buildStats = (records, field) => {
  const values = records
    .map((r) => r[field])
    .filter((v) => v !== undefined && v !== null);

  if (values.length === 0) return null;

  const sum = values.reduce((a, b) => a + b, 0);
  return {
    avg:   +(sum / values.length).toFixed(2),
    min:   Math.min(...values),
    max:   Math.max(...values),
    count: values.length,
  };
};

// ─── Generate Report Data ─────────────────────────────────────
const generateReport = async (userId, type = "weekly") => {
  const { start, end } = getDateRange(type);

  const records = await HealthData.find({
    userId,
    recordedAt: { $gte: start, $lte: end },
  }).sort({ recordedAt: 1 });

  const alerts = await AlertHistory.find({
    userId,
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 });

  // Source breakdown
  const sourceBreakdown = records.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {});

  // Alert severity breakdown
  const alertBreakdown = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});

  // Risk flags
  const emergencyCount = records.filter((r) => r.isEmergency).length;
  const riskLevel =
    emergencyCount > 5 ? "high" :
    emergencyCount > 2 ? "medium" : "low";

  return {
    reportType:  type,
    period:      { start, end },
    userId,
    totalRecords: records.length,
    sourceBreakdown,
    vitals: {
      heartRate:    buildStats(records, "heartRate"),
      oxygenLevel:  buildStats(records, "oxygenLevel"),
      temperature:  buildStats(records, "temperature"),
      glucoseLevel: buildStats(records, "glucoseLevel"),
    },
    alerts: {
      total:      alerts.length,
      resolved:   alerts.filter((a) => a.resolved).length,
      unresolved: alerts.filter((a) => !a.resolved).length,
      breakdown:  alertBreakdown,
      recent:     alerts.slice(0, 5),
    },
    riskDetection: {
      emergencyReadings: emergencyCount,
      riskLevel,
      recommendation:
        riskLevel === "high"
          ? "Immediate medical consultation recommended."
          : riskLevel === "medium"
          ? "Schedule a check-up soon."
          : "Readings are within normal range.",
    },
  };
};

// ─── Export to PDF ────────────────────────────────────────────
const exportReportAsPdf = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=health_report_${reportData.reportType}_${Date.now()}.pdf`
  );
  doc.pipe(res);

  // Title
  doc.fontSize(22).font("Helvetica-Bold")
     .text("Health Report", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica")
     .text(`Type: ${reportData.reportType.toUpperCase()}`, { align: "center" });
  doc.text(
    `Period: ${new Date(reportData.period.start).toDateString()} → ${new Date(reportData.period.end).toDateString()}`,
    { align: "center" }
  );
  doc.moveDown(1);

  // Summary
  doc.fontSize(14).font("Helvetica-Bold").text("Summary");
  doc.font("Helvetica").fontSize(11);
  doc.text(`Total Records: ${reportData.totalRecords}`);
  doc.text(`Total Alerts:  ${reportData.alerts.total}`);
  doc.text(`Risk Level:    ${reportData.riskDetection.riskLevel.toUpperCase()}`);
  doc.moveDown(1);

  // Vitals
  doc.fontSize(14).font("Helvetica-Bold").text("Vitals Statistics");
  doc.font("Helvetica").fontSize(11);
  Object.entries(reportData.vitals).forEach(([key, val]) => {
    if (val) {
      doc.text(`${key}: avg=${val.avg}  min=${val.min}  max=${val.max}  (n=${val.count})`);
    }
  });
  doc.moveDown(1);

  // Alerts
  doc.fontSize(14).font("Helvetica-Bold").text("Alert Breakdown");
  doc.font("Helvetica").fontSize(11);
  Object.entries(reportData.alerts.breakdown).forEach(([sev, count]) => {
    doc.text(`  ${sev}: ${count}`);
  });
  doc.moveDown(1);

  // Risk
  doc.fontSize(14).font("Helvetica-Bold").text("Risk Detection");
  doc.font("Helvetica").fontSize(11);
  doc.text(`Emergency Readings: ${reportData.riskDetection.emergencyReadings}`);
  doc.text(`Recommendation: ${reportData.riskDetection.recommendation}`);

  doc.end();
};

export default {
  generateReport,
  exportReportAsPdf,
};