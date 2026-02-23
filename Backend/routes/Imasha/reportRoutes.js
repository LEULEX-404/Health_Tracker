import express from 'express';
import {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport,
} from '../../controllers/Imasha/reportController.js';
import { authenticate, isAdmin } from '../../middleware/Imasha/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/reports/generate
 * @desc    Generate a new report
 * @access  Private/Admin
 */
router.post('/generate', authenticate, isAdmin, generateReport);

/**
 * @route   GET /api/reports
 * @desc    Get all reports (Admin: all, Patient: own only)
 * @access  Private
 */
router.get('/', authenticate, getAllReports);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get('/:id', authenticate, getReportById);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report
 * @access  Private
 */
router.delete('/:id', authenticate, deleteReport);

export default router;
