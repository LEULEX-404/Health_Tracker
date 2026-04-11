import express from "express";
import {
    requestBooking,
    getMyBookings,
    updateBookingStatus,
    deleteBooking,
    getAllBookingsAdmin,
    getAvailableCaregivers,
    downloadMyBookingsReport
} from "../../controllers/Tharindu/caregiverController.js";
import { authenticate, isPatient, isCaregiver, isAdmin } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get("/caregivers", getAvailableCaregivers);
router.post("/request", isPatient, requestBooking);
router.get("/my-bookings", getMyBookings);
router.get("/my-bookings/report", isPatient, downloadMyBookingsReport);
router.patch("/status/:bookingId", isCaregiver, updateBookingStatus);
router.delete("/:bookingId", deleteBooking);
router.get("/admin/all", isAdmin, getAllBookingsAdmin);

export default router;
