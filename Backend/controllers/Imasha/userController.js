import * as userService from '../../services/Imasha/userService.js';

// ==========================================
// GET ALL USERS (Admin Only)
// ==========================================
// GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, search, isActive } = req.query;

    const result = await userService.getAllUsers({
      page, limit, role, search, isActive,
    });

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully.',
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET USER BY ID
// ==========================================
// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User fetched successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================
// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE PROFILE IMAGE
// ==========================================
// PUT /api/users/:id/profile-image
export const updateProfileImage = async (req, res, next) => {
  try {
    const result = await userService.updateProfileImage(
      req.params.id,
      req.file
    );

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE USER
// ==========================================
// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {

    console.log('req.user:', req.user);
    console.log('req.params.id:', req.params.id);

    const result = await userService.deleteUser(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LINK DOCTOR ↔ PATIENT (Admin Only)
// ==========================================
// POST /api/users/link/doctor-patient
export const linkDoctorPatient = async (req, res, next) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Both doctorId and patientId are required.',
      });
    }

    const result = await userService.linkDoctorPatient(doctorId, patientId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ASSIGN CAREGIVER TO PATIENT (Admin Only)
// ==========================================
// POST /api/users/link/caregiver-patient
export const assignCaregiver = async (req, res, next) => {
  try {
    const { patientId, caregiverId } = req.body;

    if (!patientId || !caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Both patientId and caregiverId are required.',
      });
    }

    const result = await userService.assignCaregiver(patientId, caregiverId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};