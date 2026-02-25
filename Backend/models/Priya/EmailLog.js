import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
    {
        to: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        status: { type: String, enum: ['sent', 'failed'], required: true },
        messageId: { type: String, default: '' },
        error: { type: String, default: '' },
        meta: { type: Object, default: {} }
    },
    { timestamps: true }
);

export default mongoose.model('EmailLog', emailLogSchema);
