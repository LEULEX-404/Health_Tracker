import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // Report basic info
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['user_activity', 'system'],
      required: true,
    },

    // Who generated this report
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Date range for the report
    dateRange: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },

    // Report data/content
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Summary stats
    summary: {
      totalUsers:         { type: Number, default: 0 },
      totalPatients:      { type: Number, default: 0 },
      totalDoctors:       { type: Number, default: 0 },
      totalCaregivers:    { type: Number, default: 0 },
      activeUsers:        { type: Number, default: 0 },
      inactiveUsers:      { type: Number, default: 0 },
      newRegistrations:   { type: Number, default: 0 },
      verifiedUsers:      { type: Number, default: 0 },
      unverifiedUsers:    { type: Number, default: 0 },
      deletedUsers:       { type: Number, default: 0 },
      totalLogins:        { type: Number, default: 0 },
      failedLogins:       { type: Number, default: 0 },
    },

    // Report status
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });

export default mongoose.model('Report', reportSchema);
