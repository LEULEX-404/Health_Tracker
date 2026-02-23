import * as adminService from '../../services/Imasha/adminService.js';

// ==========================================
// DOCTOR MANAGEMENT CONTROLLERS
// ==========================================

/**
 * Create a new doctor
 * POST /api/admin/doctors
 */
export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await adminService.createDoctor(req.body);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors
 * GET /api/admin/doctors
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const { page, limit, search, isActive } = req.query;

    const result = await adminService.getAllDoctors({
      page, limit, search, isActive,
    });

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully.',
      data: result.doctors,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor by ID
 * GET /api/admin/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await adminService.getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doctor fetched successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor
 * PUT /api/admin/doctors/:id
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await adminService.updateDoctor(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete doctor
 * DELETE /api/admin/doctors/:id
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const result = await adminService.deleteDoctor(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CAREGIVER MANAGEMENT CONTROLLERS
// ==========================================

/**
 * Create a new caregiver
 * POST /api/admin/caregivers
 */
export const createCaregiver = async (req, res, next) => {
  try {
    const caregiver = await adminService.createCaregiver(req.body);

    res.status(201).json({
      success: true,
      message: 'Caregiver created successfully.',
      data: caregiver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all caregivers
 * GET /api/admin/caregivers
 */
export const getAllCaregivers = async (req, res, next) => {
  try {
    const { page, limit, search, isActive } = req.query;

    const result = await adminService.getAllCaregivers({
      page, limit, search, isActive,
    });

    res.status(200).json({
      success: true,
      message: 'Caregivers fetched successfully.',
      data: result.caregivers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get caregiver by ID
 * GET /api/admin/caregivers/:id
 */
export const getCaregiverById = async (req, res, next) => {
  try {
    const caregiver = await adminService.getCaregiverById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Caregiver fetched successfully.',
      data: caregiver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update caregiver
 * PUT /api/admin/caregivers/:id
 */
export const updateCaregiver = async (req, res, next) => {
  try {
    const caregiver = await adminService.updateCaregiver(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Caregiver updated successfully.',
      data: caregiver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete caregiver
 * DELETE /api/admin/caregivers/:id
 */
export const deleteCaregiver = async (req, res, next) => {
  try {
    const result = await adminService.deleteCaregiver(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
