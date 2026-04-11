import express from "express";
import { createPaymentIntent } from "../../controllers/Tharindu/paymentController.js";
import { authenticate } from "../../middleware/Imasha/authMiddleware.js";

const router = express.Router();

// All payment routes should be protected
router.use(authenticate);

// Generic endpoint to create a Stripe payment intent
router.post("/create-intent", createPaymentIntent);

export default router;
