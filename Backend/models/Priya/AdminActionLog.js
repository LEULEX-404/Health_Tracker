import mongoose from "mongoose";

const adminActionLogSchema = new mongoose.Schema(
    {
        appointmentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Appointment' },
        action: { type: String, enum: ['confirm', 'cancel'], required: true },
        status: { type: String, default: '', trim: true },
        actor: { type: String, default: '', trim: true },
        message: { type: String, default: '' },
        meta: { type: Object, default: {} }
    },
    { timestamps: true }
);

export default mongoose.model('AdminActionLog', adminActionLogSchema);