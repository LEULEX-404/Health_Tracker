import mongoose from "mongoose";
 

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    ipAddress: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });

export default mongoose.model("AuditLog", auditLogSchema);