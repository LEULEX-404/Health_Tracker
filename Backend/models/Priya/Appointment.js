import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        doctor: { type: String, required: true, trim: true },
        specialty: { type: String, default: '', trim: true },
        status: { type: String, default: 'Pending', trim: true },
        date: { type: String, required: true, trim: true },
        time: { type: String, required: true, trim: true },
        duration: { type: String, default: '', trim: true },
        type: { type: String, default: 'In Person', trim: true },
        location: { type: String, default: '', trim: true },
        avatar: { type: String, default: 'https://i.pravatar.cc/150?img=12', trim: true },
        patientName: { type: String, default: '', trim: true },
        patientEmail: { type: String, default: '', trim: true },
        patientPhone: { type: String, default: '', trim: true }
    },
    { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
