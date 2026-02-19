import User from '../../models/Imasha/User.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/Imasha/errors.js';
import { USER_ROLES } from '../../constants/Imasha/index.js';
import { validateEmail, validatePassword } from '../../utils/Imasha/validation.js';

// ==========================================
// DOCTOR MANAGEMENT
// ==========================================

/**
 * Create a new doctor
 */
export const createDoctor = async (doctorData) => {
  const { firstName, lastName, email, password, phone, dateOfBirth, gender, address } = doctorData;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError('First name, last name, email, and password are required.');
  }

  // Validate email format
  validateEmail(email);

  // Validate password
  validatePassword(password);

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists.');
  }

  // Create new doctor
  const doctor = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    dateOfBirth,
    gender,
    address,
    role: USER_ROLES.DOCTOR,
    isActive: true,
    isEmailVerified: true, // Admin-created doctors are pre-verified
  });

  await doctor.save();

  // Return doctor without sensitive data
  const doctorResponse = doctor.toObject();
  delete doctorResponse.password;
  delete doctorResponse.emailVerificationToken;
  delete doctorResponse.passwordResetToken;

  return doctorResponse;
};

/**
 * Get all doctors
 */
export const getAllDoctors = async ({ page = 1, limit = 10, search, isActive }) => {
  const query = { 
    role: USER_ROLES.DOCTOR,
    isDeleted: false 
  };

  // Filter by status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('linkedPatients', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    doctors,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (doctorId) => {
  const doctor = await User.findOne({ 
    _id: doctorId, 
    role: USER_ROLES.DOCTOR,
    isDeleted: false 
  })
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('linkedPatients', 'firstName lastName email profileImage');

  if (!doctor) {
    throw new NotFoundError('Doctor not found.');
  }

  return doctor;
};

/**
 * Update doctor
 */
export const updateDoctor = async (doctorId, updateData) => {
  const doctor = await User.findOne({ 
    _id: doctorId, 
    role: USER_ROLES.DOCTOR,
    isDeleted: false 
  });

  if (!doctor) {
    throw new NotFoundError('Doctor not found.');
  }

  // Validate email if provided
  if (updateData.email && updateData.email !== doctor.email) {
    validateEmail(updateData.email);
    
    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: updateData.email.toLowerCase(),
      _id: { $ne: doctorId }
    });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }
    updateData.email = updateData.email.toLowerCase();
  }

  // Validate password if provided
  if (updateData.password) {
    validatePassword(updateData.password);
  }

  // Allowed fields for update
  const allowedFields = [
    'firstName', 'lastName', 'email', 'password', 
    'phone', 'dateOfBirth', 'gender', 'address', 
    'isActive', 'isEmailVerified'
  ];

  // Build update object
  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  const updatedDoctor = await User.findByIdAndUpdate(
    doctorId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken');

  return updatedDoctor;
};

/**
 * Delete doctor (soft delete)
 */
export const deleteDoctor = async (doctorId) => {
  const doctor = await User.findOne({ 
    _id: doctorId, 
    role: USER_ROLES.DOCTOR,
    isDeleted: false 
  });

  if (!doctor) {
    throw new NotFoundError('Doctor not found.');
  }

  // Soft delete
  doctor.isDeleted = true;
  doctor.deletedAt = new Date();
  doctor.isActive = false;
  await doctor.save();

  // Remove doctor from linked patients
  await User.updateMany(
    { linkedDoctor: doctorId },
    { $unset: { linkedDoctor: '' } }
  );

  // Remove patients from doctor's linkedPatients array
  doctor.linkedPatients = [];
  await doctor.save();

  return { message: 'Doctor deleted successfully.' };
};

// ==========================================
// CAREGIVER MANAGEMENT
// ==========================================

/**
 * Create a new caregiver
 */
export const createCaregiver = async (caregiverData) => {
  const { firstName, lastName, email, password, phone, dateOfBirth, gender, address } = caregiverData;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError('First name, last name, email, and password are required.');
  }

  // Validate email format
  validateEmail(email);

  // Validate password
  validatePassword(password);

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists.');
  }

  // Create new caregiver
  const caregiver = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    dateOfBirth,
    gender,
    address,
    role: USER_ROLES.CAREGIVER,
    isActive: true,
    isEmailVerified: true, // Admin-created caregivers are pre-verified
  });

  await caregiver.save();

  // Return caregiver without sensitive data
  const caregiverResponse = caregiver.toObject();
  delete caregiverResponse.password;
  delete caregiverResponse.emailVerificationToken;
  delete caregiverResponse.passwordResetToken;

  return caregiverResponse;
};

/**
 * Get all caregivers
 */
export const getAllCaregivers = async ({ page = 1, limit = 10, search, isActive }) => {
  const query = { 
    role: USER_ROLES.CAREGIVER,
    isDeleted: false 
  };

  // Filter by status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [caregivers, total] = await Promise.all([
    User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('linkedPatients', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    caregivers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get caregiver by ID
 */
export const getCaregiverById = async (caregiverId) => {
  const caregiver = await User.findOne({ 
    _id: caregiverId, 
    role: USER_ROLES.CAREGIVER,
    isDeleted: false 
  })
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('linkedPatients', 'firstName lastName email profileImage');

  if (!caregiver) {
    throw new NotFoundError('Caregiver not found.');
  }

  return caregiver;
};

/**
 * Update caregiver
 */
export const updateCaregiver = async (caregiverId, updateData) => {
  const caregiver = await User.findOne({ 
    _id: caregiverId, 
    role: USER_ROLES.CAREGIVER,
    isDeleted: false 
  });

  if (!caregiver) {
    throw new NotFoundError('Caregiver not found.');
  }

  // Validate email if provided
  if (updateData.email && updateData.email !== caregiver.email) {
    validateEmail(updateData.email);
    
    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: updateData.email.toLowerCase(),
      _id: { $ne: caregiverId }
    });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }
    updateData.email = updateData.email.toLowerCase();
  }

  // Validate password if provided
  if (updateData.password) {
    validatePassword(updateData.password);
  }

  // Allowed fields for update
  const allowedFields = [
    'firstName', 'lastName', 'email', 'password', 
    'phone', 'dateOfBirth', 'gender', 'address', 
    'isActive', 'isEmailVerified'
  ];

  // Build update object
  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  const updatedCaregiver = await User.findByIdAndUpdate(
    caregiverId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken');

  return updatedCaregiver;
};

/**
 * Delete caregiver (soft delete)
 */
export const deleteCaregiver = async (caregiverId) => {
  const caregiver = await User.findOne({ 
    _id: caregiverId, 
    role: USER_ROLES.CAREGIVER,
    isDeleted: false 
  });

  if (!caregiver) {
    throw new NotFoundError('Caregiver not found.');
  }

  // Soft delete
  caregiver.isDeleted = true;
  caregiver.deletedAt = new Date();
  caregiver.isActive = false;
  await caregiver.save();

  // Remove caregiver from linked patients
  await User.updateMany(
    { linkedCaregiver: caregiverId },
    { $unset: { linkedCaregiver: '' } }
  );

  // Remove patients from caregiver's linkedPatients array
  caregiver.linkedPatients = [];
  await caregiver.save();

  return { message: 'Caregiver deleted successfully.' };
};
