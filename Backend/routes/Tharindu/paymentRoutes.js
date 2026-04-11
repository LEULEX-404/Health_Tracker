import express from "express";
import {
  createPaymentIntent,
  getMyPaymentHistory,
  requestBookingRefund,
  verifyPaymentIntent,
} from "../../controllers/Tharindu/paymentController.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// All payment routes should be protected
router.use(authenticate);

// Generic endpoint to create a Stripe payment intent
router.post("/create-intent", createPaymentIntent);
router.post("/verify", verifyPaymentIntent);
router.post("/refund/:bookingId", requestBookingRefund);
router.get("/history", getMyPaymentHistory);

export default router;
