import Report from '../../models/Imasha/Report.js';
import User from '../../models/Imasha/User.js';
import AuditLog from '../../models/Imasha/AuditLog.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/Imasha/errors.js';
import PDFDocument from 'pdfkit';

// ==========================================
// GENERATE REPORT
// ==========================================
export const generateReport = async ({ type, title, dateFrom, dateTo, requestingUser }) => {

  // Validate date range
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new BadRequestError('Invalid date format. Use YYYY-MM-DD.');
  }

  if (fromDate > toDate) {
    throw new BadRequestError('dateFrom must be before dateTo.');
  }

  // Set toDate to end of day
  toDate.setHours(23, 59, 59, 999);

  // Create report with 'generating' status
  const report = new Report({
    title: title || `${type} Report - ${new Date().toLocaleDateString()}`,
    type,
    generatedBy: requestingUser._id,
    dateRange: {
      from: fromDate,
      to: toDate,
    },
    status: 'generating',
  });

  await report.save();

  try {
    let reportData = {};
    let summary = {};

    // ==========================================
    // USER ACTIVITY REPORT
    // ==========================================
    if (type === 'user_activity') {
      // All non-deleted users (for totals / overview); date range applies to newRegistrations & activeInRange below
      const allUsers = await User.find({
        isDeleted: false,
      }).select('firstName lastName email role isActive isEmailVerified createdAt lastLoginAt');

      // New registrations in date range
      const newRegistrations = await User.find({
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      }).select('firstName lastName email role createdAt isEmailVerified');

      // Active users (logged in during date range)
      const activeInRange = await User.find({
        isDeleted: false,
        lastLoginAt: { $gte: fromDate, $lte: toDate },
      }).select('firstName lastName email role lastLoginAt');

      // Users by role
      const usersByRole = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      // Daily registrations
      const dailyRegistrations = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Audit logs (login activity)
      const loginActivity = await AuditLog.find({
        action: { $in: ['USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED'] },
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(100);

      const totalUsers = allUsers.length;
      const totalPatients = allUsers.filter(u => u.role === 'patient').length;
      const totalDoctors = allUsers.filter(u => u.role === 'doctor').length;
      const totalCaregivers = allUsers.filter(u => u.role === 'caregiver').length;
      const activeUsers = allUsers.filter(u => u.isActive).length;
      const inactiveUsers = allUsers.filter(u => !u.isActive).length;
      const verifiedUsers = allUsers.filter(u => u.isEmailVerified).length;
      const unverifiedUsers = allUsers.filter(u => !u.isEmailVerified).length;

      const totalLogins = loginActivity.filter(l => l.action === 'USER_LOGIN').length;
      const failedLogins = loginActivity.filter(l => l.action === 'USER_LOGIN_FAILED').length;

      summary = {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalCaregivers,
        activeUsers,
        inactiveUsers,
        newRegistrations: newRegistrations.length,
        verifiedUsers,
        unverifiedUsers,
        deletedUsers: 0,
        totalLogins,
        failedLogins,
      };

      reportData = {
        overview: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalCaregivers,
          activeUsers,
          inactiveUsers,
          verifiedUsers,
          unverifiedUsers,
        },
        newRegistrations: {
          count: newRegistrations.length,
          users: newRegistrations,
        },
        activeInRange: {
          count: activeInRange.length,
          users: activeInRange,
        },
        usersByRole,
        dailyRegistrations,
        loginActivity: {
          totalLogins,
          failedLogins,
          recentActivity: loginActivity.slice(0, 20),
        },
      };
    }

    // ==========================================
    // SYSTEM REPORT
    // ==========================================
    if (type === 'system') {
      // Total counts
      const totalUsers = await User.countDocuments({ isDeleted: false });
      const totalDeleted = await User.countDocuments({ isDeleted: true });
      const activeUsers = await User.countDocuments({ isDeleted: false, isActive: true });
      const inactiveUsers = await User.countDocuments({ isDeleted: false, isActive: false });
      const verifiedUsers = await User.countDocuments({ isDeleted: false, isEmailVerified: true });
      const unverifiedUsers = await User.countDocuments({ isDeleted: false, isEmailVerified: false });

      // Users by role
      const usersByRole = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      // New users per month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyGrowth = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Recent audit logs
      const recentAuditLogs = await AuditLog.find({
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(50);

      // Error logs
      const errorLogs = await AuditLog.find({
        status: 'failure',
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      // Total audit logs
      const totalAuditLogs = await AuditLog.countDocuments({
        createdAt: { $gte: fromDate, $lte: toDate },
      });

      // Reports generated
      const totalReports = await Report.countDocuments({
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      });

      // New users in this period
      const newRegistrationsCount = await User.countDocuments({
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      });

      summary = {
        totalUsers,
        totalPatients: usersByRole.find(r => r._id === 'patient')?.count || 0,
        totalDoctors: usersByRole.find(r => r._id === 'doctor')?.count || 0,
        totalCaregivers: usersByRole.find(r => r._id === 'caregiver')?.count || 0,
        activeUsers,
        inactiveUsers,
        newRegistrations: newRegistrationsCount,
        verifiedUsers,
        unverifiedUsers,
        deletedUsers: totalDeleted,
        totalLogins: recentAuditLogs.filter(l => l.action === 'USER_LOGIN').length,
        failedLogins: errorLogs.length,
      };

      reportData = {
        userStats: {
          totalUsers,
          totalDeleted,
          activeUsers,
          inactiveUsers,
          verifiedUsers,
          unverifiedUsers,
          byRole: usersByRole,
        },
        systemHealth: {
          totalAuditLogs,
          totalReports,
          errorCount: errorLogs.length,
          recentErrors: errorLogs.slice(0, 10),
        },
        monthlyGrowth,
        recentActivity: recentAuditLogs.slice(0, 20),
      };
    }

    // Update report with completed data
    report.data = reportData;
    report.summary = summary;
    report.status = 'completed';
    await report.save();

    return report;

  } catch (error) {
    // Mark report as failed
    report.status = 'failed';
    await report.save();
    throw error;
  }
};

// ==========================================
// GET ALL REPORTS
// ==========================================
export const getAllReports = async ({ page = 1, limit = 10, type, status, requestingUser }) => {
  const query = { isDeleted: false };

  // Admin sees all reports, patient sees only their own
  if (requestingUser.role !== 'admin') {
    query.generatedBy = requestingUser._id;
  }

  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate('generatedBy', 'firstName lastName email role')
      .select('-data')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Report.countDocuments(query),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==========================================
// GET REPORT BY ID
// ==========================================
export const getReportById = async (reportId, requestingUser) => {
  const report = await Report.findOne({ _id: reportId, isDeleted: false })
    .populate('generatedBy', 'firstName lastName email role');

  if (!report) throw new NotFoundError('Report not found.');

  // Patients can only see their own reports
  if (
    requestingUser.role !== 'admin' &&
    report.generatedBy._id.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('Access denied. You can only view your own reports.');
  }

  return report;
};

// ==========================================
// DELETE REPORT
// ==========================================
export const deleteReport = async (reportId, requestingUser) => {
  const report = await Report.findOne({ _id: reportId, isDeleted: false });

  if (!report) throw new NotFoundError('Report not found.');

  // Admin can delete any, patient can only delete their own
  if (
    requestingUser.role !== 'admin' &&
    report.generatedBy.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('Access denied. You can only delete your own reports.');
  }

  // Soft delete
  report.isDeleted = true;
  report.deletedAt = new Date();
  await report.save();

  return { message: 'Report deleted successfully.' };
};

// ==========================================
// GENERATE PDF REPORT
// ==========================================
export const generateReportPdf = async (reportId, requestingUser, res) => {
  const report = await getReportById(reportId, requestingUser);

  // Initialize PDF Document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="PulseNova_Report_${report.type}_${report._id}.pdf"`
  );

  // Pipe the PDF to the response stream
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

  // Custom Heartbeat Logo Vector (Matching exact Logo.jsx svg path)
  // Outer circle: cx=18, cy=18, r=17 -> Center roughly at (68, 55). radius 17
  doc.circle(68, 55, 17).lineWidth(2).strokeColor(PRIMARY).stroke();

  // Inner Pulse: M4 18 L10 18 L13 11 L16 25 L19 14 L22 20 L25 18 L32 18
  // Offset by (+50, +37) ->
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

  doc.fillColor(SECONDARY).font('Helvetica-Bold').fontSize(22).text(report.title, 70, 145, { align: 'left' });

  doc.font('Helvetica').fontSize(10).fillColor(TEXT_MUTED)
    .text(`Report Type: `, 70, 175, { continued: true }).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text(`${report.type === 'user_activity' ? 'User Activity & Growth' : 'System Health'}`)
    .font('Helvetica').fillColor(TEXT_MUTED).text(`Date Range: `, 70, 190, { continued: true }).font('Helvetica-Bold').fillColor(SECONDARY).text(`${new Date(report.dateRange.from).toLocaleDateString()} - ${new Date(report.dateRange.to).toLocaleDateString()}`);

  // Right side meta
  doc.font('Helvetica').fillColor(TEXT_MUTED).fontSize(9)
    .text(`Generated By: ${report.generatedBy.firstName} ${report.generatedBy.lastName} (${report.generatedBy.role})`, 50, 175, { align: 'right', width: doc.page.width - 120 })
    .text(`Date: ${new Date(report.createdAt).toLocaleString()}`, 50, 190, { align: 'right', width: doc.page.width - 120 });

  doc.moveDown(3);

  // --- Summary Metrics Box Layout ---
  doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('EXECUTIVE SUMMARY', 50, doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
  doc.moveDown(1);

  const summary = report.summary;

  // Helper to draw a metric card
  const drawMetricCard = (x, y, title, value) => {
    doc.rect(x, y, 110, 60).fill('white').lineWidth(1).strokeColor('#E0E0E0').stroke();
    doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9).text(title, x, y + 15, { width: 110, align: 'center' });
    doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(18).text(String(value), x, y + 35, { width: 110, align: 'center' });
  };

  const startY = doc.y;
  drawMetricCard(50, startY, 'Total Users', summary.totalUsers);
  drawMetricCard(175, startY, 'Active Users', summary.activeUsers);
  drawMetricCard(300, startY, 'Total Patients', summary.totalPatients);
  drawMetricCard(425, startY, 'New Registrations', summary.newRegistrations);

  doc.moveDown(6);

  // --- Detailed Data Section ---
  if (report.data) {
    doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('DETAILED REPORT LOGS', 50, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
    doc.moveDown(1);

    if (report.type === 'system' && report.data.recentActivity) {
      // System Health Metrics Table
      if (report.data.systemHealth) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(SECONDARY).text('System Health Errors', 50, doc.y);
        doc.moveDown(0.5);

        doc.rect(50, doc.y, doc.page.width - 100, 20).fill('#D9534F');
        let errY = doc.y + 6;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
        doc.text('Date & Time', 60, errY, { continued: false });
        doc.text('User Email', 190, errY, { continued: false });
        doc.text('Error Description', 310, errY, { continued: false });
        doc.moveDown(1.5);

        doc.font('Helvetica').fontSize(9);
        report.data.systemHealth.recentErrors.slice(0, 10).forEach((err, i) => {
          if (i % 2 === 0) doc.rect(50, doc.y - 2, doc.page.width - 100, 18).fill('#FAFAFA');
          doc.fillColor(TEXT_MUTED).text(new Date(err.createdAt).toLocaleString(), 60, doc.y + 2);

          let userEmail = 'System / Unknown';
          if (err.userId && err.userId.email) {
            userEmail = err.userId.email;
          } else if (err.description) {
            const emailMatch = err.description.match(/[\w.-]+@[\w.-]+\.\w+/);
            if (emailMatch) {
              userEmail = emailMatch[0];
            } else {
              userEmail = 'Unknown User';
            }
          }

          doc.fillColor(SECONDARY).text(userEmail, 190, doc.y - 11);

          doc.fillColor('#D9534F').text(`${err.action} - ${err.description}`, 310, doc.y - 11);
          doc.moveDown(0.5);
        });
        doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
        doc.moveDown(2);
      }

      // Audit Logs Table
      doc.font('Helvetica-Bold').fontSize(12).fillColor(SECONDARY).text('Recent Audit Logs', 50, doc.y);
      doc.moveDown(0.5);

      doc.rect(50, doc.y, doc.page.width - 100, 20).fill(PRIMARY_DARK);
      const headY = doc.y + 6;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      doc.text('Date & Time', 60, headY, { continued: false });
      doc.text('User', 190, headY, { continued: false });
      doc.text('Action', 310, headY, { continued: false });

      doc.moveDown(1.5);

      doc.font('Helvetica').fontSize(9);
      report.data.recentActivity.slice(0, 15).forEach((log, i) => {
        let userName = 'System';
        if (log.userId) {
          if (log.userId.firstName) userName = `${log.userId.firstName} ${log.userId.lastName}`;
          else if (log.userId.email) userName = log.userId.email;
        } else if (log.description) {
          const emailMatch = log.description.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) {
            userName = emailMatch[0];
          } else {
            userName = 'Unknown User';
          }
        }

        if (i % 2 === 0) doc.rect(50, doc.y - 2, doc.page.width - 100, 18).fill('#FAFAFA');

        doc.fillColor(TEXT_MUTED).text(new Date(log.createdAt).toLocaleString(), 60, doc.y + 2);
        doc.fillColor(SECONDARY).text(userName, 190, doc.y - 11);

        const actionColor = log.status === 'success' ? PRIMARY_DARK : '#D9534F';

        // Clean the description to avoid printing the email twice
        let cleanDescription = log.description;
        if (cleanDescription.includes(userName)) {
          cleanDescription = cleanDescription.replace(userName, '').replace(':', '').trim();
        }

        doc.fillColor(actionColor).text(`${log.action} - ${cleanDescription}`, 310, doc.y - 11);

        doc.moveDown(0.5);
      });
      doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
      doc.moveDown(2);

      // Monthly Growth Table
      if (report.data.monthlyGrowth && report.data.monthlyGrowth.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(SECONDARY).text('Monthly Growth (Last 6 Months)', 50, doc.y);
        doc.moveDown(0.5);

        doc.rect(50, doc.y, doc.page.width - 100, 20).fill(PRIMARY_DARK);
        const gwY = doc.y + 6;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
        doc.text('Month/Year', 60, gwY, { continued: false });
        doc.text('New Users', 310, gwY, { continued: false });

        doc.moveDown(1.5);

        doc.font('Helvetica').fontSize(9);
        report.data.monthlyGrowth.forEach((gw, i) => {
          if (i % 2 === 0) doc.rect(50, doc.y - 2, doc.page.width - 100, 18).fill('#FAFAFA');

          // Format month to 2 digits
          const monthStr = gw._id.month.toString().padStart(2, '0');
          doc.fillColor(TEXT_MUTED).text(`${monthStr}/${gw._id.year}`, 60, doc.y + 2);
          doc.fillColor(PRIMARY_DARK).text(`+ ${gw.count} users`, 310, doc.y - 11);
          doc.moveDown(0.5);
        });
        doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
        doc.moveDown(2);
      }
    }

    if (report.type === 'user_activity' && report.data.newRegistrations) {
      // Table Header Background
      doc.rect(50, doc.y, doc.page.width - 100, 20).fill(PRIMARY_DARK);

      const headY = doc.y + 6;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      doc.text('Join Date', 60, headY, { continued: false });
      doc.text('Name', 160, headY, { continued: false });
      doc.text('Role', 320, headY, { continued: false });
      doc.text('Email', 400, headY, { continued: false });

      doc.moveDown(1.5);

      doc.font('Helvetica').fontSize(9);
      report.data.newRegistrations.users.slice(0, 15).forEach((usr, i) => {
        if (i % 2 === 0) doc.rect(50, doc.y - 2, doc.page.width - 100, 18).fill('#FAFAFA');

        doc.fillColor(TEXT_MUTED).text(new Date(usr.createdAt).toLocaleDateString(), 60, doc.y + 2);
        doc.fillColor(SECONDARY).text(`${usr.firstName} ${usr.lastName}`, 160, doc.y - 11);
        doc.fillColor(PRIMARY_DARK).text(usr.role.toUpperCase(), 320, doc.y - 11);
        doc.fillColor(TEXT_MUTED).text(usr.email, 400, doc.y - 11);
        doc.moveDown(0.5);
      });
      // Bottom table border
      doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
    }
  }

  // --- Footer ---
  const pageHeight = doc.page.height;

  // Footer Line
  doc.moveTo(50, pageHeight - 65).lineTo(doc.page.width - 50, pageHeight - 65).lineWidth(1).strokeColor('#E0E0E0').stroke();

  doc.fontSize(8).fillColor('#aaaaaa')
    .text('PulseNova Health Tracking System - Confidential & Proprietary', 50, pageHeight - 50, { align: 'center', lineBreak: false })
    .text('Generated via PulseNova Admin Dashboard - Do not distribute without authorization', 50, pageHeight - 40, { align: 'center', lineBreak: false });

  // Bottom Color Bar
  doc.rect(0, pageHeight - 10, doc.page.width, 10).fill(PRIMARY_DARK);

  doc.end();
};
