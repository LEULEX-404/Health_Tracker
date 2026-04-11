import mongoose from "mongoose";

const caregiverBookingSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        caregiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String, // e.g., "09:00"
            required: true,
        },
        endTime: {
            type: String, // e.g., "17:00"
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"],
            default: "Pending",
        },
        notes: {
            type: String,
        },
        paymentIntentId: {
            type: String,
            index: true,
            sparse: true,
        },
        paymentRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },
        baseAmount: {
            type: Number,
            default: 0,
        },
        totalPaidAmount: {
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
            enum: ["not_applicable", "locked", "available", "pending", "refunded", "failed"],
            default: "not_applicable",
        },
        refundId: {
            type: String,
        },
        refundAmount: {
            type: Number,
            default: 0,
        },
        refundRequestedAt: {
            type: Date,
        },
        refundedAt: {
            type: Date,
        },
        refundFailureMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const CaregiverBooking = mongoose.model("CaregiverBooking", caregiverBookingSchema);

export default CaregiverBooking;
