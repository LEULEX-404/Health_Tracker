import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  createCaregiver,
  getAllCaregivers,
  getCaregiverById,
  updateCaregiver,
  deleteCaregiver,
} from '../../controllers/Imasha/adminController.js';
import { authenticate, isAdmin } from '../../middleware/Imasha/authMiddleware.js';

const router = express.Router();

// ==========================================
// DOCTOR MANAGEMENT ROUTES (Admin Only)
// ==========================================

/**
 * @route   POST /api/admin/doctors
 * @desc    Create a new doctor
 * @access  Private/Admin
 */
router.post('/doctors', authenticate, isAdmin, createDoctor);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors
 * @access  Private/Admin
 */
router.get('/doctors', authenticate, isAdmin, getAllDoctors);

/**
 * @route   GET /api/admin/doctors/:id
 * @desc    Get doctor by ID
 * @access  Private/Admin
 */
router.get('/doctors/:id', authenticate, isAdmin, getDoctorById);

/**
 * @route   PUT /api/admin/doctors/:id
 * @desc    Update doctor
 * @access  Private/Admin
 */
router.put('/doctors/:id', authenticate, isAdmin, updateDoctor);

/**
 * @route   DELETE /api/admin/doctors/:id
 * @desc    Delete doctor (soft delete)
 * @access  Private/Admin
 */
router.delete('/doctors/:id', authenticate, isAdmin, deleteDoctor);

// ==========================================
// CAREGIVER MANAGEMENT ROUTES (Admin Only)
// ==========================================

/**
 * @route   POST /api/admin/caregivers
 * @desc    Create a new caregiver
 * @access  Private/Admin
 */
router.post('/caregivers', authenticate, isAdmin, createCaregiver);

/**
 * @route   GET /api/admin/caregivers
 * @desc    Get all caregivers
 * @access  Private/Admin
 */
router.get('/caregivers', authenticate, isAdmin, getAllCaregivers);

/**
 * @route   GET /api/admin/caregivers/:id
 * @desc    Get caregiver by ID
 * @access  Private/Admin
 */
router.get('/caregivers/:id', authenticate, isAdmin, getCaregiverById);

/**
 * @route   PUT /api/admin/caregivers/:id
 * @desc    Update caregiver
 * @access  Private/Admin
 */
router.put('/caregivers/:id', authenticate, isAdmin, updateCaregiver);

/**
 * @route   DELETE /api/admin/caregivers/:id
 * @desc    Delete caregiver (soft delete)
 * @access  Private/Admin
 */
router.delete('/caregivers/:id', authenticate, isAdmin, deleteCaregiver);

export default router;
