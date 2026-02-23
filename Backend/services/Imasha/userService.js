import User from '../../models/Imasha/User.js';
import cloudinary from '../../utils/Imasha/cloudinary.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/Imasha/errors.js';

// ==========================================
// GET ALL USERS (Admin Only)
// ==========================================
export const getAllUsers = async ({ page = 1, limit = 10, role, search, isActive }) => {
  const query = { isDeleted: false };

  // Filter by role
  if (role) query.role = role;

  // Filter by status
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==========================================
// GET USER BY ID
// ==========================================
export const getUserById = async (userId) => {
  const user = await User.findOne({ _id: userId, isDeleted: false })
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('linkedDoctor',    'firstName lastName email profileImage')
    .populate('linkedPatients',  'firstName lastName email profileImage')
    .populate('linkedCaregiver', 'firstName lastName email profileImage');

  if (!user) throw new NotFoundError('User not found.');

  return user;
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================
export const updateUser = async (userId, updateData, requestingUser) => {
  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) throw new NotFoundError('User not found.');

  // Only admin can change roles
  if (updateData.role && requestingUser.role !== 'admin') {
    throw new ForbiddenError('Only admins can change user roles.');
  }

  // Only admin can change isActive status
  if (updateData.isActive !== undefined && requestingUser.role !== 'admin') {
    throw new ForbiddenError('Only admins can activate/deactivate users.');
  }

  // Fields users can update themselves
  const allowedFields = [
    'firstName', 'lastName', 'phone',
    'dateOfBirth', 'gender', 'address',
  ];

  // Extra fields admin can update
  const adminOnlyFields = ['role', 'isActive', 'isEmailVerified'];

  // Build update object
  const updates = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) updates[field] = updateData[field];
  });

  if (requestingUser.role === 'admin') {
    adminOnlyFields.forEach((field) => {
      if (updateData[field] !== undefined) updates[field] = updateData[field];
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken');

  return updatedUser;
};

// ==========================================
// UPDATE PROFILE IMAGE
// ==========================================
export const updateProfileImage = async (userId, file) => {
  if (!file) throw new BadRequestError('No image file provided.');

  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) throw new NotFoundError('User not found.');

  // Delete old profile image from Cloudinary
  if (user.profileImage) {
    try {
      const publicId = user.profileImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`healthcare/profile-images/${publicId}`);
    } catch (err) {
      console.error('Failed to delete old profile image:', err.message);
    }
  }

  // Save new image URL (Cloudinary URL from multer)
  user.profileImage = file.path;
  await user.save();

  return { profileImage: user.profileImage };
};

// ==========================================
// DELETE USER (Soft Delete)
// ==========================================
export const deleteUser = async (userId, requestingUser) => {

  // Check requestingUser exists first
  if (!requestingUser || !requestingUser._id) {
    throw new Error('Unauthorized: requesting user not found.');
  }


  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) throw new NotFoundError('User not found.');

  // Prevent self-deletion
  if (userId.toString() === requestingUser._id.toString()) {
    throw new BadRequestError('You cannot delete your own account.');
  }

    // Add this null check
  if (!requestingUser) {
    throw new ForbiddenError('Requesting user not found.');
  }

  // safe check
  if (requestingUser._id && userId === requestingUser._id.toString()) {
    throw new BadRequestError('You cannot delete your own account.');
  }

  // Soft delete
  user.isDeleted  = true;
  user.deletedAt  = new Date();
  user.isActive   = false;
  await user.save();

  return { message: 'User deleted successfully.' };
};

// ==========================================
// LINK DOCTOR ↔ PATIENT
// ==========================================
export const linkDoctorPatient = async (doctorId, patientId) => {
  const [doctor, patient] = await Promise.all([
    User.findOne({ _id: doctorId, role: 'doctor', isDeleted: false }),
    User.findOne({ _id: patientId, role: 'patient', isDeleted: false }),
  ]);

  if (!doctor)  throw new NotFoundError('Doctor not found.');
  if (!patient) throw new NotFoundError('Patient not found.');

  // Link patient to doctor
  if (!doctor.linkedPatients) doctor.linkedPatients = [];
  if (!doctor.linkedPatients.includes(patientId)) {
    doctor.linkedPatients.push(patientId);
    await doctor.save();
  }

  // Link doctor to patient
  patient.linkedDoctor = doctorId;
  await patient.save();

  return { message: 'Doctor and patient linked successfully.' };
};

// ==========================================
// ASSIGN CAREGIVER TO PATIENT
// ==========================================
export const assignCaregiver = async (patientId, caregiverId) => {
  const [patient, caregiver] = await Promise.all([
    User.findOne({ _id: patientId, role: 'patient', isDeleted: false }),
    User.findOne({ _id: caregiverId, role: 'caregiver', isDeleted: false }),
  ]);

  if (!patient)   throw new NotFoundError('Patient not found.');
  if (!caregiver) throw new NotFoundError('Caregiver not found.');

  // Assign caregiver to patient
  patient.linkedCaregiver = caregiverId;
  await patient.save();

  // Link patient to caregiver
  if (!caregiver.linkedPatients) caregiver.linkedPatients = [];
  if (!caregiver.linkedPatients.includes(patientId)) {
    caregiver.linkedPatients.push(patientId);
    await caregiver.save();
  }

  return { message: 'Caregiver assigned successfully.' };
};