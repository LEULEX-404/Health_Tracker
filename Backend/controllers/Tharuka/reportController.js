import reportService from "../../services/Tharuka/reportService.js";

// ─── GET /api/reports/weekly/:userId ─────────────────────────
const weeklyReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const report     = await reportService.generateReport(userId, "weekly");

    return res.status(200).json({
      success: true,
      data:    report,
    });
  } catch (error) {
    console.error("weeklyReport error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/reports/monthly/:userId ────────────────────────
const monthlyReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const report     = await reportService.generateReport(userId, "monthly");

    return res.status(200).json({
      success: true,
      data:    report,
    });
  } catch (error) {
    console.error("monthlyReport error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/reports/export/pdf/:userId ─────────────────────
const exportPdf = async (req, res) => {
  try {
    const { userId }             = req.params;
    const { type = "weekly" }    = req.query;

    const report = await reportService.generateReport(userId, type);
    reportService.exportReportAsPdf(report, res);
    // Response is streamed — no res.json() here
  } catch (error) {
    console.error("exportPdf error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default {
  weeklyReport,
  monthlyReport,
  exportPdf,
};