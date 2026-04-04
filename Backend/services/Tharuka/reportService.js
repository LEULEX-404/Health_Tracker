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
    recentRecords: records.slice(-15).reverse(), // Supply fresh logs for PDF rendering
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
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="PulseNova_Health_Report_${reportData.reportType}_${Date.now()}.pdf"`
  );

  doc.pipe(res);

  // --- Theme Colors ---
  const PRIMARY = '#00C897';
  const PRIMARY_DARK = '#00A07A';
  const SECONDARY = '#333333';
  const LIGHT_GRAY = '#F4F7F6';
  const TEXT_MUTED = '#666666';

  // --- Top Header Bar ---
  doc.rect(0, 0, doc.page.width, 10).fill(PRIMARY);

  // --- Header Section ---
  doc.moveDown(1);

  // Custom Heartbeat Logo Vector
  doc.circle(68, 55, 17).lineWidth(2).strokeColor(PRIMARY).stroke();
  doc.strokeColor(PRIMARY_DARK).lineWidth(2.2)
    .moveTo(54, 55)
    .lineTo(60, 55)
    .lineTo(63, 48)
    .lineTo(66, 62)
    .lineTo(69, 51)
    .lineTo(72, 57)
    .lineTo(75, 55)
    .lineTo(82, 55)
    .stroke();

  // Company Name
  doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(28).text('PulseNova', 100, 40, { align: 'left' });
  doc.fillColor(SECONDARY).font('Helvetica').fontSize(10).text('Every Pulse Matters', 100, 70, { align: 'left' });

  // Company Details (Right side)
  doc.fillColor(TEXT_MUTED).fontSize(9)
    .text('100, Kandy road, malabe', 50, 45, { align: 'right' })
    .text('support@healthcare.com', 50, 58, { align: 'right' })
    .text('+94 76 215 7137', 50, 71, { align: 'right' });

  // Divider Line
  doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).lineWidth(1).strokeColor('#E0E0E0').stroke();

  // --- Report Title & Meta ---
  doc.moveDown(4);

  // Title Card Background
  doc.rect(50, 130, doc.page.width - 100, 80).fill(LIGHT_GRAY);

  doc.fillColor(SECONDARY).font('Helvetica-Bold').fontSize(22).text(`Patient Health Report`, 70, 145, { align: 'left' });

  doc.font('Helvetica').fontSize(10).fillColor(TEXT_MUTED)
    .text(`Report Type: `, 70, 175, { continued: true }).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text(reportData.reportType.toUpperCase())
    .font('Helvetica').fillColor(TEXT_MUTED).text(`Date Range: `, 70, 190, { continued: true }).font('Helvetica-Bold').fillColor(SECONDARY).text(`${new Date(reportData.period.start).toLocaleDateString()} - ${new Date(reportData.period.end).toLocaleDateString()}`);

  // Right side meta
  doc.font('Helvetica').fillColor(TEXT_MUTED).fontSize(9)
    .text(`Patient ID: ${reportData.userId}`, 50, 175, { align: 'right', width: doc.page.width - 120 })
    .text(`Generated: ${new Date().toLocaleString()}`, 50, 190, { align: 'right', width: doc.page.width - 120 });

  doc.moveDown(3);

  // --- Executive Summary Box Layout ---
  doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('EXECUTIVE SUMMARY', 50, doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
  doc.moveDown(1);

  // Metric Helper
  const drawMetricCard = (x, y, title, value) => {
    doc.rect(x, y, 110, 60).fill('white').lineWidth(1).strokeColor('#E0E0E0').stroke();
    doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9).text(title, x, y + 15, { width: 110, align: 'center' });
    let isEmergency = title.includes('Emergency') && value > 0;
    doc.fillColor(isEmergency ? '#D9534F' : PRIMARY_DARK).font('Helvetica-Bold').fontSize(18).text(String(value), x, y + 35, { width: 110, align: 'center' });
  };

  const startY = doc.y;
  drawMetricCard(50, startY, 'Total Records', reportData.totalRecords);
  drawMetricCard(175, startY, 'Total Alerts', reportData.alerts.total);
  drawMetricCard(300, startY, 'Unresolved Alerts', reportData.alerts.unresolved);
  drawMetricCard(425, startY, 'Emergency DB', reportData.riskDetection.emergencyReadings);

  doc.moveDown(6);

  // --- Detailed Data Section ---
  doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('VITALS & RISK ANALYSIS', 50, doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
  doc.moveDown(1);

  // Risk Detection
  doc.rect(50, doc.y, doc.page.width - 100, 25).fill(reportData.riskDetection.riskLevel === 'high' ? '#f9dede' : '#e6fcf5');
  doc.fillColor(SECONDARY).font('Helvetica-Bold').fontSize(11).text('Overall Risk Level: ', 60, doc.y + 7, { continued: true })
    .fillColor(reportData.riskDetection.riskLevel === 'high' ? '#D9534F' : PRIMARY_DARK)
    .text(reportData.riskDetection.riskLevel.toUpperCase(), { continued: true })
    .fillColor(TEXT_MUTED).font('Helvetica').text(`  —  ${reportData.riskDetection.recommendation}`);
  doc.moveDown(2);

  // Vitals Table
  doc.font('Helvetica-Bold').fontSize(12).fillColor(SECONDARY).text('Vitals Statistics', 50, doc.y);
  doc.moveDown(0.5);

  const tableTop = doc.y;
  doc.rect(50, tableTop, doc.page.width - 100, 20).fill(PRIMARY_DARK);
  
  const headY = tableTop + 6;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
  doc.text('Vital Metric', 60, headY);
  doc.text('Average', 200, headY);
  doc.text('Minimum', 320, headY);
  doc.text('Maximum', 440, headY);

  doc.moveDown(1.5);
  doc.font('Helvetica').fontSize(10);
  
  const vEntries = Object.entries(reportData.vitals).filter(([k,v]) => v !== null);
  vEntries.forEach(([key, val], i) => {
    const rowY = doc.y;
    if (i % 2 === 0) doc.rect(50, rowY - 2, doc.page.width - 100, 18).fill('#FAFAFA');
    
    let displayKey = key.replace(/([A-Z])/g, ' $1').trim();
    displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
    
    doc.fillColor(SECONDARY).text(displayKey, 60, rowY + 2);
    doc.fillColor(TEXT_MUTED).text(val.avg.toString(), 200, rowY + 2);
    doc.fillColor(PRIMARY_DARK).text(val.min.toString(), 320, rowY + 2);
    doc.fillColor('#D9534F').text(val.max.toString(), 440, rowY + 2);
    doc.moveDown(0.5);
  });
  doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
  doc.moveDown(2);

  // --- Recent Health Logs Table ---
  if (reportData.recentRecords && reportData.recentRecords.length > 0) {
    if (doc.y > doc.page.height - 150) doc.addPage();

    doc.font('Helvetica-Bold').fontSize(12).fillColor(SECONDARY).text('Recent Health Logs', 50, doc.y);
    doc.moveDown(0.5);

    const logTop = doc.y;
    doc.rect(50, logTop, doc.page.width - 100, 20).fill(PRIMARY_DARK);
    
    const logHeadY = logTop + 6;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
    doc.text('Date & Time', 60, logHeadY);
    doc.text('Heart Rate', 180, logHeadY);
    doc.text('Blood Pressure', 260, logHeadY);
    doc.text('Oxygen', 360, logHeadY);
    doc.text('Status', 440, logHeadY);

    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(9);

    reportData.recentRecords.forEach((log, i) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        // Redraw Header on new page if needed or just continue
      }

      const rowY = doc.y;
      if (i % 2 === 0) doc.rect(50, rowY - 2, doc.page.width - 100, 18).fill('#FAFAFA');

      const rawDate = log.recordedAt || log.createdAt || log.date;
      const parsedDate = new Date(rawDate);
      const dateStr = !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
      const hrStr = log.heartRate ? `${log.heartRate} bpm` : '--';
      const bpStr = log.bloodPressure?.systolic ? `${log.bloodPressure.systolic}/${log.bloodPressure.diastolic}` : '--';
      const o2Str = log.oxygenLevel ? `${log.oxygenLevel}%` : '--';
      const statusStr = log.isEmergency ? 'EMERGENCY' : 'Normal';
      const statusColor = log.isEmergency ? '#D9534F' : PRIMARY_DARK;

      doc.fillColor(TEXT_MUTED).text(dateStr, 60, rowY + 2);
      doc.fillColor(SECONDARY).text(hrStr, 180, rowY + 2);
      doc.fillColor(SECONDARY).text(bpStr, 260, rowY + 2);
      doc.fillColor(SECONDARY).text(o2Str, 360, rowY + 2);
      doc.fillColor(statusColor).text(statusStr, 440, rowY + 2);

      doc.moveDown(0.5);
    });

    doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
    doc.moveDown(2);
  }

  // --- Footer ---
  const pageHeight = doc.page.height;

  // Footer Line
  doc.moveTo(50, pageHeight - 65).lineTo(doc.page.width - 50, pageHeight - 65).lineWidth(1).strokeColor('#E0E0E0').stroke();

  doc.fontSize(8).fillColor('#aaaaaa')
    .text('PulseNova Health Tracking System - Confidential & Proprietary', 50, pageHeight - 50, { align: 'center', lineBreak: false })
    .text('Generated via PulseNova Patient Dashboard - Do not distribute without authorization', 50, pageHeight - 40, { align: 'center', lineBreak: false });

  // Bottom Color Bar
  doc.rect(0, pageHeight - 10, doc.page.width, 10).fill(PRIMARY_DARK);

  doc.end();
};

export default {
  generateReport,
  exportReportAsPdf,
};