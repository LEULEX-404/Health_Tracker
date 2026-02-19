import Report from '../../models/Imasha/Report.js';
import User from '../../models/Imasha/User.js';
import AuditLog from '../../models/Imasha/AuditLog.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/Imasha/errors.js';

// ==========================================
// GENERATE REPORT
// ==========================================
export const generateReport = async ({ type, title, dateFrom, dateTo, requestingUser }) => {

  // Validate date range
  const fromDate = new Date(dateFrom);
  const toDate   = new Date(dateTo);

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
    title:       title || `${type} Report - ${new Date().toLocaleDateString()}`,
    type,
    generatedBy: requestingUser._id,
    dateRange: {
      from: fromDate,
      to:   toDate,
    },
    status: 'generating',
  });

  await report.save();

  try {
    let reportData = {};
    let summary    = {};

    // ==========================================
    // USER ACTIVITY REPORT
    // ==========================================
    if (type === 'user_activity') {
      // All users in date range
      const allUsers = await User.find({
        isDeleted: false,
        createdAt: { $lte: toDate },
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
        action:    { $in: ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'] },
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(100);

      const totalUsers     = allUsers.length;
      const totalPatients  = allUsers.filter(u => u.role === 'patient').length;
      const totalDoctors   = allUsers.filter(u => u.role === 'doctor').length;
      const totalCaregivers = allUsers.filter(u => u.role === 'caregiver').length;
      const activeUsers    = allUsers.filter(u => u.isActive).length;
      const inactiveUsers  = allUsers.filter(u => !u.isActive).length;
      const verifiedUsers  = allUsers.filter(u => u.isEmailVerified).length;
      const unverifiedUsers = allUsers.filter(u => !u.isEmailVerified).length;

      const totalLogins  = loginActivity.filter(l => l.action === 'LOGIN').length;
      const failedLogins = loginActivity.filter(l => l.action === 'FAILED_LOGIN').length;

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
      const totalUsers      = await User.countDocuments({ isDeleted: false });
      const totalDeleted    = await User.countDocuments({ isDeleted: true });
      const activeUsers     = await User.countDocuments({ isDeleted: false, isActive: true });
      const inactiveUsers   = await User.countDocuments({ isDeleted: false, isActive: false });
      const verifiedUsers   = await User.countDocuments({ isDeleted: false, isEmailVerified: true });
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
              year:  { $year:  '$createdAt' },
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
        status:    'failed',
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

      summary = {
        totalUsers,
        totalPatients:    usersByRole.find(r => r._id === 'patient')?.count    || 0,
        totalDoctors:     usersByRole.find(r => r._id === 'doctor')?.count     || 0,
        totalCaregivers:  usersByRole.find(r => r._id === 'caregiver')?.count  || 0,
        activeUsers,
        inactiveUsers,
        newRegistrations: 0,
        verifiedUsers,
        unverifiedUsers,
        deletedUsers:     totalDeleted,
        totalLogins:      recentAuditLogs.filter(l => l.action === 'LOGIN').length,
        failedLogins:     errorLogs.length,
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
          errorCount:    errorLogs.length,
          recentErrors:  errorLogs.slice(0, 10),
        },
        monthlyGrowth,
        recentActivity: recentAuditLogs.slice(0, 20),
      };
    }

    // Update report with completed data
    report.data    = reportData;
    report.summary = summary;
    report.status  = 'completed';
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

  if (type)   query.type   = type;
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
      page:       Number(page),
      limit:      Number(limit),
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
