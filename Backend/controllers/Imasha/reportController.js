import * as reportService from '../../services/Imasha/reportService.js';

// ==========================================
// GENERATE REPORT
// ==========================================
// POST /api/reports/generate
export const generateReport = async (req, res, next) => {
  try {
    const { type, title, dateFrom, dateTo } = req.body;

    if (!type || !dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'type, dateFrom and dateTo are required.',
      });
    }

    if (!['user_activity', 'system'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Use: user_activity or system.',
      });
    }

    const report = await reportService.generateReport({
      type,
      title,
      dateFrom,
      dateTo,
      requestingUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ALL REPORTS
// ==========================================
// GET /api/reports
export const getAllReports = async (req, res, next) => {
  try {
    const { page, limit, type, status } = req.query;

    const result = await reportService.getAllReports({
      page,
      limit,
      type,
      status,
      requestingUser: req.user,
    });

    res.status(200).json({
      success: true,
      message: 'Reports fetched successfully.',
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET REPORT BY ID
// ==========================================
// GET /api/reports/:id
export const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Report fetched successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE REPORT
// ==========================================
// DELETE /api/reports/:id
export const deleteReport = async (req, res, next) => {
  try {
    const result = await reportService.deleteReport(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
