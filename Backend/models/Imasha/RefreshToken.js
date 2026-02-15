import mongoose from "mongoose";


const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: Date,
    replacedByToken: String,
    createdByIP: String,
    revokedByIP: String,
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);