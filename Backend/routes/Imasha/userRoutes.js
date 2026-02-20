import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateProfileImage,
  deleteUser,
  linkDoctorPatient,
  assignCaregiver,
} from '../../controllers/Imasha/userController.js';
import { authenticate, isAdmin } from '../../middleware/Imasha/authMiddleware.js';
import {
  uploadProfileImage,
  handleUploadError,
} from '../../middleware/Imasha/uploadMiddleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (None - all require auth)
// ==========================================

// ==========================================
// PROTECTED ROUTES (Require Login)
// ==========================================

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put('/:id', authenticate, updateUser);

/**
 * @route   PUT /api/users/:id/profile-image
 * @desc    Upload/update profile image
 * @access  Private
 */
router.put(
  '/:id/profile-image',
  authenticate,
  uploadProfileImage,
  handleUploadError,
  updateProfileImage
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, deleteUser);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

/**
 * @route   POST /api/users/link/doctor-patient
 * @desc    Link a doctor to a patient
 * @access  Private/Admin
 */
router.post('/link/doctor-patient', authenticate, isAdmin, linkDoctorPatient);

/**
 * @route   POST /api/users/link/caregiver-patient
 * @desc    Assign caregiver to a patient
 * @access  Private/Admin
 */
router.post('/link/caregiver-patient', authenticate, isAdmin, assignCaregiver);

export default router;