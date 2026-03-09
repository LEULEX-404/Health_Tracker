import CaregiverBooking from "../../models/Tharindu/CaregiverBooking.js";
import User from "../../models/Imasha/User.js";
import { sendNotification } from "../../services/Tharindu/notificationService.js";

/**
 * Request a new caregiver booking (Patient action)
 */
export const requestBooking = async (req, res) => {
    try {
        const { caregiverId, date, startTime, endTime, notes } = req.body;
        const patientId = req.user.id;

        // Verify caregiver exists and is actually a caregiver
        const caregiver = await User.findById(caregiverId);
        if (!caregiver || caregiver.role !== "caregiver") {
            return res.status(404).json({ message: "Caregiver not found" });
        }

        const booking = await CaregiverBooking.create({
            patientId,
            caregiverId,
            date,
            startTime,
            endTime,
            notes,
        });

        // Notify Caregiver
        const message = `New booking request from patient for ${date} at ${startTime}.`;
        await sendNotification(caregiverId, "inApp", message, {
            bookingId: booking._id,
            patientId,
        });

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get bookings for the logged-in user (Patient or Caregiver)
 */
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const query = role === "caregiver" ? { caregiverId: userId } : { patientId: userId };

        const bookings = await CaregiverBooking.find(query)
            .populate("patientId", "name email phone")
            .populate("caregiverId", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update booking status (Caregiver action)
 */
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const caregiverId = req.user.id;

        const booking = await CaregiverBooking.findOne({ _id: bookingId, caregiverId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        booking.status = status;
        await booking.save();

        // Notify Patient
        const message = `Your caregiver booking request has been ${status.toLowerCase()}.`;
        await sendNotification(booking.patientId, "inApp", message, {
            bookingId: booking._id,
            status,
        });

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a booking (Patient or Caregiver action)
 */
export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        // Find booking where the user is either the patient or the caregiver
        const booking = await CaregiverBooking.findOne({
            _id: bookingId,
            $or: [{ patientId: userId }, { caregiverId: userId }]
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        await CaregiverBooking.findByIdAndDelete(bookingId);

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
