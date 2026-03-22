import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import Appointment from "../models/Priya/Appointment.js";
import Doctor from "../models/Imasha/Doctor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

function normalizeDoctorName(name) {
  return (name || "").toLowerCase().replace(/^dr\.\s*/i, "").trim();
}

async function run() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_FALLBACK;
  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGO_URI_FALLBACK is required.");
  }

  await mongoose.connect(mongoUri);

  const doctorDocs = await Doctor.find({ isDeleted: false }).populate({
    path: "user",
    match: { isDeleted: false, role: "doctor" },
    select: "firstName lastName",
  });

  const doctorsByName = new Map();
  doctorDocs.forEach((doc) => {
    if (!doc.user) return;
    const normalized = normalizeDoctorName(`${doc.user.firstName || ""} ${doc.user.lastName || ""}`);
    if (normalized) doctorsByName.set(normalized, doc._id);
  });

  const appointments = await Appointment.find({
    $or: [{ doctorId: { $exists: false } }, { doctorId: null }],
  }).select("_id doctor");

  let updated = 0;
  for (const appointment of appointments) {
    const key = normalizeDoctorName(appointment.doctor);
    const doctorId = doctorsByName.get(key);
    if (!doctorId) continue;
    await Appointment.updateOne({ _id: appointment._id }, { $set: { doctorId } });
    updated += 1;
  }

  console.log(`Scanned: ${appointments.length}`);
  console.log(`Updated: ${updated}`);

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error("Backfill failed:", err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore disconnect errors
    }
    process.exit(1);
  });
