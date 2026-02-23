import bcrypt from 'bcryptjs';
import User from '../../models/Imasha/User.js';
import Doctor from '../../models/Imasha/Doctor.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/Imasha/errors.js';
import { USER_ROLES } from '../../constants/Imasha/index.js';
import { validateEmail, validatePassword } from '../../utils/Imasha/validation.js';

// ==========================================
// DOCTOR MANAGEMENT (User + Doctor models, 1:1)
// ==========================================

const USER_FIELDS = [
  'firstName', 'lastName', 'email', 'password',
  'phone', 'dateOfBirth', 'gender', 'address',
  'isActive', 'isEmailVerified',
];
const DOCTOR_FIELDS = ['specialization', 'licenseNumber', 'hospitalOrClinic', 'qualifications'];

const userSelect = '-password -emailVerificationToken -passwordResetToken';

/**
 * Build a single doctor response from Doctor doc + populated User
 */
function toDoctorResponse(doctorDoc, userDoc) {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const doctor = doctorDoc.toObject ? doctorDoc.toObject() : doctorDoc;
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  return {
    _id: doctor._id,
    userId: user._id,
    ...user,
    specialization: doctor.specialization,
    licenseNumber: doctor.licenseNumber,
    hospitalOrClinic: doctor.hospitalOrClinic,
    qualifications: doctor.qualifications,
  };
}

/**
 * Create a new doctor: creates User (role doctor) + Doctor document (1:1)
 */
export const createDoctor = async (doctorData) => {
  const {
    firstName, lastName, email, password, phone, dateOfBirth, gender, address,
    specialization, licenseNumber, hospitalOrClinic, qualifications,
  } = doctorData;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError('First name, last name, email, and password are required.');
  }

  validateEmail(email);
  validatePassword(password);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists.');
  }

  const user = new User({
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
    isEmailVerified: true,
  });
  await user.save();

  const doctor = new Doctor({
    user: user._id,
    specialization: specialization || undefined,
    licenseNumber: licenseNumber || undefined,
    hospitalOrClinic: hospitalOrClinic || undefined,
    qualifications: qualifications || undefined,
  });
  await doctor.save();

  const userPopulated = await User.findById(user._id)
    .select(userSelect)
    .populate('linkedPatients', 'firstName lastName email');
  return toDoctorResponse(doctor, userPopulated);
};

/**
 * Get all doctors: list from Doctor collection, join User; filter by User not deleted
 */
export const getAllDoctors = async ({ page = 1, limit = 10, search, isActive }) => {
  const match = { isDeleted: false };
  const lookup = {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userDoc',
    },
  };
  const unwind = { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: false } };
  const userMatch = { $match: { 'userDoc.role': USER_ROLES.DOCTOR, 'userDoc.isDeleted': false } };
  const pipeline = [
    { $match: match },
    lookup,
    unwind,
    userMatch,
  ];

  if (isActive !== undefined) {
    pipeline.push({ $match: { 'userDoc.isActive': isActive === 'true' } });
  }
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'userDoc.firstName': { $regex: search, $options: 'i' } },
          { 'userDoc.lastName': { $regex: search, $options: 'i' } },
          { 'userDoc.email': { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const [countResult] = await Doctor.aggregate(countPipeline);
  const total = countResult?.total ?? 0;

  const skip = (Number(page) - 1) * Number(limit);
  const dataPipeline = [
    ...pipeline,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'userDoc.linkedPatients',
        foreignField: '_id',
        as: 'linkedPatients',
      },
    },
    {
      $project: {
        _id: 1,
        user: 1,
        specialization: 1,
        licenseNumber: 1,
        hospitalOrClinic: 1,
        qualifications: 1,
        createdAt: 1,
        updatedAt: 1,
        'userDoc._id': 1,
        'userDoc.firstName': 1,
        'userDoc.lastName': 1,
        'userDoc.email': 1,
        'userDoc.phone': 1,
        'userDoc.dateOfBirth': 1,
        'userDoc.gender': 1,
        'userDoc.address': 1,
        'userDoc.isActive': 1,
        'userDoc.isEmailVerified': 1,
        'userDoc.profileImage': 1,
        'userDoc.linkedPatients': 1,
        linkedPatients: 1,
      },
    },
  ];

  const docs = await Doctor.aggregate(dataPipeline);
  const doctors = docs.map((d) => {
    const userDoc = {
      _id: d.userDoc._id,
      firstName: d.userDoc.firstName,
      lastName: d.userDoc.lastName,
      email: d.userDoc.email,
      phone: d.userDoc.phone,
      dateOfBirth: d.userDoc.dateOfBirth,
      gender: d.userDoc.gender,
      address: d.userDoc.address,
      isActive: d.userDoc.isActive,
      isEmailVerified: d.userDoc.isEmailVerified,
      profileImage: d.userDoc.profileImage,
      linkedPatients: d.linkedPatients && d.linkedPatients.length ? d.linkedPatients : (d.userDoc.linkedPatients || []),
    };
    return toDoctorResponse(
      {
        _id: d._id,
        user: d.user,
        specialization: d.specialization,
        licenseNumber: d.licenseNumber,
        hospitalOrClinic: d.hospitalOrClinic,
        qualifications: d.qualifications,
      },
      userDoc
    );
  });

  return {
    doctors,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

/**
 * Get doctor by ID (Doctor document _id)
 */
export const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false })
    .populate({
      path: 'user',
      select: userSelect,
      populate: { path: 'linkedPatients', select: 'firstName lastName email profileImage' },
    });

  if (!doctor || !doctor.user) {
    throw new NotFoundError('Doctor not found.');
  }
  const user = doctor.user;
  if (user.isDeleted) {
    throw new NotFoundError('Doctor not found.');
  }
  return toDoctorResponse(doctor, user);
};

/**
 * Update doctor: update both User and Doctor by splitting payload
 */
export const updateDoctor = async (doctorId, updateData) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false }).populate('user');
  if (!doctor || !doctor.user) {
    throw new NotFoundError('Doctor not found.');
  }
  const user = doctor.user;
  if (user.isDeleted) {
    throw new NotFoundError('Doctor not found.');
  }

  const userId = user._id;

  if (updateData.email && updateData.email.toLowerCase() !== user.email) {
    validateEmail(updateData.email);
    const existingUser = await User.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }
  }
  if (updateData.password) {
    validatePassword(updateData.password);
  }

  const userUpdates = {};
  USER_FIELDS.forEach((field) => {
    if (updateData[field] !== undefined) {
      userUpdates[field] = field === 'email' ? updateData[field].toLowerCase() : updateData[field];
    }
  });
  if (userUpdates.password) {
    const salt = await bcrypt.genSalt(12);
    userUpdates.password = await bcrypt.hash(userUpdates.password, salt);
  }
  if (Object.keys(userUpdates).length) {
    await User.findByIdAndUpdate(userId, { $set: userUpdates }, { runValidators: true });
  }

  const doctorUpdates = {};
  DOCTOR_FIELDS.forEach((field) => {
    if (updateData[field] !== undefined) {
      doctorUpdates[field] = updateData[field];
    }
  });
  if (Object.keys(doctorUpdates).length) {
    await Doctor.findByIdAndUpdate(doctorId, { $set: doctorUpdates }, { runValidators: true });
  }

  const updatedDoctor = await Doctor.findById(doctorId)
    .populate({
      path: 'user',
      select: userSelect,
      populate: { path: 'linkedPatients', select: 'firstName lastName email profileImage' },
    });
  return toDoctorResponse(updatedDoctor, updatedDoctor.user);
};

/**
 * Delete doctor: soft delete User and Doctor, unlink patients
 */
export const deleteDoctor = async (doctorId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false }).populate('user');
  if (!doctor || !doctor.user) {
    throw new NotFoundError('Doctor not found.');
  }
  const userId = doctor.user._id;

  doctor.user.isDeleted = true;
  doctor.user.deletedAt = new Date();
  doctor.user.isActive = false;
  await doctor.user.save();

  doctor.isDeleted = true;
  doctor.deletedAt = new Date();
  await doctor.save();

  await User.updateMany(
    { linkedDoctor: userId },
    { $unset: { linkedDoctor: '' } }
  );
  await User.findByIdAndUpdate(userId, { $set: { linkedPatients: [] } });

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

  if (updates.password) {
    const salt = await bcrypt.genSalt(12);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

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
