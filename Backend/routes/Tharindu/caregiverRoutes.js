import express from "express";
import {
    requestBooking,
    getMyBookings,
    updateBookingStatus,
    deleteBooking
} from "../../controllers/Tharindu/caregiverController.js";
import { authenticate, isPatient, isCaregiver } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post("/request", isPatient, requestBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/status/:bookingId", isCaregiver, updateBookingStatus);
router.delete("/:bookingId", deleteBooking);

export default router;
