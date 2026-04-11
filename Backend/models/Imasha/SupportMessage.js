import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema(
  {
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SupportMessage', supportMessageSchema);
