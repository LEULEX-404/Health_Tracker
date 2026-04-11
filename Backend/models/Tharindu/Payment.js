import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: "stripe",
    },
    module: {
      type: String,
      default: "caregiver_booking",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaregiverBooking",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: String,
    status: {
      type: String,
      default: "created",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    failureMessage: String,
    verifiedAt: Date,
    lastWebhookEventId: String,
    lastWebhookType: String,
    lastWebhookAt: Date,
    baseAmount: {
      type: Number,
      default: 0,
    },
    refundProtectionSelected: {
      type: Boolean,
      default: false,
    },
    refundProtectionFee: {
      type: Number,
      default: 0,
    },
    refundableAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: [
        "not_applicable",
        "locked",
        "available",
        "pending",
        "refunded",
        "failed",
      ],
      default: "not_applicable",
      index: true,
    },
    refundId: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundRequestedAt: Date,
    refundedAt: Date,
    refundFailureMessage: String,
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
