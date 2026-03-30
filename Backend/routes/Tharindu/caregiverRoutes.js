import express from "express";
import {
    requestBooking,
    getMyBookings,
    updateBookingStatus,
<<<<<<< Updated upstream
    deleteBooking
=======
    updateBookingStatusByAdmin,
    deleteBooking,
    getAllBookingsAdmin,
    getAvailableCaregivers,
    downloadMyBookingsReport
>>>>>>> Stashed changes
} from "../../controllers/Tharindu/caregiverController.js";
import { authenticate, isPatient, isCaregiver, isAdmin } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post("/request", isPatient, requestBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/status/:bookingId", isCaregiver, updateBookingStatus);
router.patch("/admin/status/:bookingId", isAdmin, updateBookingStatusByAdmin);
router.delete("/:bookingId", deleteBooking);

export default router;
