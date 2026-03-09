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
    },
    {
        timestamps: true,
    }
);

const CaregiverBooking = mongoose.model("CaregiverBooking", caregiverBookingSchema);

export default CaregiverBooking;
