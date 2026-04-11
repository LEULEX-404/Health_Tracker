import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from '../database.js';
import User from '../models/Imasha/User.js';
import Doctor from '../models/Imasha/Doctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DOCTORS = [
  {
    firstName: 'Priyangani',
    lastName: 'Ratnayake',
    email: 'priyangani@gmail.com',
    password: 'Doctor@123',
    phone: '0771234567',
    specialization: 'Cardiology',
    licenseNumber: 'DOC-1001',
    hospitalOrClinic: 'Care4Life Colombo',
    qualifications: 'MBBS, MD Cardiology',
  },
  {
    firstName: 'Oshika',
    lastName: 'Arunalu',
    email: 'arunaluoshika@gmail.com',
    password: 'Doctor@123',
    phone: '0761234567',
    specialization: 'Endocrinology',
    licenseNumber: 'DOC-1002',
    hospitalOrClinic: 'Care4Life Kandy',
    qualifications: 'MBBS, MD Endocrinology',
  },
  {
    firstName: 'Tharaka',
    lastName: 'Sanjeewa',
    email: 'miyurut39@gmail.com',
    password: 'Doctor@123',
    phone: '0751234567',
    specialization: 'General Medicine',
    licenseNumber: 'DOC-1003',
    hospitalOrClinic: 'Care4Life Galle',
    qualifications: 'MBBS, MSc Clinical Medicine',
  },
];

async function upsertDoctor(seed) {
  let user = await User.findOne({ email: seed.email.toLowerCase() });

  if (!user) {
    user = new User({
      firstName: seed.firstName,
      lastName: seed.lastName,
      email: seed.email.toLowerCase(),
      password: seed.password,
      phone: seed.phone,
      role: 'doctor',
      isActive: true,
      isEmailVerified: true,
      hasCompletedOnboarding: true,
    });
    await user.save();
    console.log(`Created user: ${seed.email}`);
  } else {
    user.firstName = seed.firstName;
    user.lastName = seed.lastName;
    user.phone = seed.phone;
    user.role = 'doctor';
    user.isActive = true;
    user.isEmailVerified = true;
    user.hasCompletedOnboarding = true;
    user.password = seed.password;
    await user.save();
    console.log(`Updated user: ${seed.email}`);
  }

  let doctor = await Doctor.findOne({ user: user._id });
  if (!doctor) {
    doctor = new Doctor({
      user: user._id,
      specialization: seed.specialization,
      licenseNumber: seed.licenseNumber,
      hospitalOrClinic: seed.hospitalOrClinic,
      qualifications: seed.qualifications,
    });
    await doctor.save();
    console.log(`Created doctor profile: ${seed.email}`);
  } else {
    doctor.specialization = seed.specialization;
    doctor.licenseNumber = seed.licenseNumber;
    doctor.hospitalOrClinic = seed.hospitalOrClinic;
    doctor.qualifications = seed.qualifications;
    doctor.isDeleted = false;
    doctor.deletedAt = undefined;
    await doctor.save();
    console.log(`Updated doctor profile: ${seed.email}`);
  }

  return { email: seed.email, password: seed.password };
}

async function run() {
  await connectDB();

  const created = [];
  for (const seed of DOCTORS) {
    const result = await upsertDoctor(seed);
    created.push(result);
  }

  console.log('\nDoctor credentials:');
  created.forEach((item, index) => {
    console.log(`${index + 1}. ${item.email} / ${item.password}`);
  });

  process.exit(0);
}

run().catch((error) => {
  console.error('Failed to seed doctors:', error.message);
  process.exit(1);
});
