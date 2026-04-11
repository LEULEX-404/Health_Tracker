import Stripe from "stripe";
import Payment from "../../models/Tharindu/Payment.js";
import CaregiverBooking from "../../models/Tharindu/CaregiverBooking.js";
import {
  applyRefundResultToBooking,
  calculateCaregiverBookingAmounts,
  CAREGIVER_SESSION_BASE_AMOUNT,
  CAREGIVER_REFUND_PROTECTION_FEE,
  getRefundEligibilityMessage,
  hydratePaymentRefundDetails,
} from "../../services/Tharindu/caregiverRefundService.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

const toInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
};

const stripReservedMetadata = (metadata = {}) => {
  const clone = { ...metadata };
  delete clone.userId;
  delete clone.module;
  return clone;
};

const toStripeMetadata = (metadata = {}) => {
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = String(value);
    return acc;
  }, {});
};

const getStripeClient = () => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
  }

  return stripe;
};

const syncPaymentRecordFromIntent = async (paymentIntent, overrides = {}) => {
  const existingRecord = await Payment.findOne({
    paymentIntentId: paymentIntent.id,
  });

  const rawMetadata = paymentIntent.metadata || {};
  const sanitizedMetadata = stripReservedMetadata(rawMetadata);
  const refundProtectionSelected =
    toBoolean(rawMetadata.refundProtectionSelected) ||
    existingRecord?.refundProtectionSelected ||
    false;
  const baseAmount = toInteger(
    rawMetadata.baseAmount,
    existingRecord?.baseAmount || CAREGIVER_SESSION_BASE_AMOUNT,
  );
  const refundProtectionFee = refundProtectionSelected
    ? toInteger(
        rawMetadata.refundProtectionFee,
        existingRecord?.refundProtectionFee || CAREGIVER_REFUND_PROTECTION_FEE,
      )
    : 0;
  const refundableAmount = refundProtectionSelected
    ? toInteger(
        rawMetadata.refundableAmount,
        existingRecord?.refundableAmount || baseAmount,
      )
    : 0;
  const refundStatus =
    overrides.refundStatus ||
    existingRecord?.refundStatus ||
    (refundProtectionSelected ? "locked" : "not_applicable");

  const recordPayload = {
    userId: rawMetadata.userId || existingRecord?.userId,
    paymentIntentId: paymentIntent.id,
    provider: "stripe",
    module: rawMetadata.module || existingRecord?.module || "caregiver_booking",
    bookingId: rawMetadata.bookingId || existingRecord?.bookingId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    description: paymentIntent.description || "",
    status: paymentIntent.status,
    metadata: sanitizedMetadata,
    failureMessage:
      paymentIntent.last_payment_error?.message || overrides.failureMessage,
    verifiedAt:
      paymentIntent.status === "succeeded"
        ? overrides.verifiedAt || new Date()
        : existingRecord?.verifiedAt,
    lastWebhookEventId:
      overrides.lastWebhookEventId || existingRecord?.lastWebhookEventId,
    lastWebhookType:
      overrides.lastWebhookType || existingRecord?.lastWebhookType,
    lastWebhookAt: overrides.lastWebhookType
      ? new Date()
      : existingRecord?.lastWebhookAt,
    baseAmount,
    refundProtectionSelected,
    refundProtectionFee,
    refundableAmount,
    refundStatus,
    refundId: overrides.refundId || existingRecord?.refundId,
    refundAmount: overrides.refundAmount || existingRecord?.refundAmount || 0,
    refundRequestedAt:
      overrides.refundRequestedAt || existingRecord?.refundRequestedAt,
    refundedAt: overrides.refundedAt || existingRecord?.refundedAt,
    refundFailureMessage:
      overrides.refundFailureMessage || existingRecord?.refundFailureMessage,
  };

  if (!recordPayload.userId) {
    throw new Error(
      `Unable to sync payment ${paymentIntent.id} because no userId was found`,
    );
  }

  return Payment.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    { $set: recordPayload },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const createPaymentIntent = async (req, res) => {
  try {
    const stripeClient = getStripeClient();
    const { amount, currency = "lkr", description, metadata = {} } = req.body;
    const parsedAmount = Number.parseInt(amount, 10);
    const refundProtectionSelected = toBoolean(metadata.refundProtectionSelected);
    const expectedCharge =
      calculateCaregiverBookingAmounts(refundProtectionSelected);

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "A valid positive amount is required to create a payment intent.",
      });
    }

    if (parsedAmount !== expectedCharge.totalAmount) {
      return res.status(400).json({
        message:
          "The payment amount does not match the caregiver session fee configuration.",
      });
    }

    const userId = req.user?._id?.toString();
    const metadataForStripe = toStripeMetadata(metadata);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: parsedAmount,
      currency: String(currency).toLowerCase(),
      payment_method_types: ["card"],
      description: description || "PulseNova Services Payment",
      metadata: {
        userId,
        module: "caregiver_booking",
        ...metadataForStripe,
        refundProtectionSelected: String(refundProtectionSelected),
        baseAmount: String(expectedCharge.baseAmount),
        refundProtectionFee: String(expectedCharge.refundProtectionFee),
        refundableAmount: String(expectedCharge.refundableAmount),
        totalAmount: String(expectedCharge.totalAmount),
      },
    });

    const paymentRecord = await syncPaymentRecordFromIntent(paymentIntent);

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentRecordId: paymentRecord._id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      refundProtectionSelected,
      refundableAmount: expectedCharge.refundableAmount,
    });
  } catch (error) {
    console.error("Stripe PaymentIntent Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPaymentIntent = async (req, res) => {
  try {
    const stripeClient = getStripeClient();
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required." });
    }

    const paymentIntent =
      await stripeClient.paymentIntents.retrieve(paymentIntentId);
    const paymentRecord = await syncPaymentRecordFromIntent(paymentIntent, {
      verifiedAt: paymentIntent.status === "succeeded" ? new Date() : undefined,
    });

    if (paymentRecord.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to verify this payment.",
      });
    }

    return res.status(200).json({
      success: true,
      verified: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      paymentRecordId: paymentRecord._id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      refundProtectionSelected: paymentRecord.refundProtectionSelected,
      refundableAmount: paymentRecord.refundableAmount,
    });
  } catch (error) {
    console.error("Stripe Payment Verification Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMyPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const requestBookingRefund = async (req, res) => {
  try {
    const stripeClient = getStripeClient();
    const { bookingId } = req.params;

    const booking = await CaregiverBooking.findOne({
      _id: bookingId,
      patientId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or you do not have permission to refund it.",
      });
    }

    const ineligibleReason = getRefundEligibilityMessage(booking);
    if (ineligibleReason) {
      return res.status(400).json({ message: ineligibleReason });
    }

    if (!booking.paymentIntentId) {
      return res.status(400).json({
        message: "This booking does not have a linked payment to refund.",
      });
    }

    const payment = await Payment.findOne({
      paymentIntentId: booking.paymentIntentId,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found for this booking.",
      });
    }

    const refundDetails = hydratePaymentRefundDetails(payment);
    const refundAmount = booking.refundableAmount || refundDetails.refundableAmount;

    if (refundAmount <= 0) {
      return res.status(400).json({
        message: "This booking does not have a refundable amount.",
      });
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: booking.paymentIntentId,
      amount: refundAmount,
      reason: "requested_by_customer",
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        module: "caregiver_booking",
        refundProtectionSelected: String(booking.refundProtectionSelected),
      },
    });

    await applyRefundResultToBooking({ booking, refund });

    return res.status(200).json({
      success: true,
      message:
        refund.status === "succeeded"
          ? "Refund processed successfully."
          : "Refund request submitted successfully.",
      data: {
        bookingId: booking._id,
        refundId: refund.id,
        refundStatus: booking.refundStatus,
        refundAmount,
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error("Stripe Refund Error:", error);

    if (req.params?.bookingId) {
      const booking = await CaregiverBooking.findOne({
        _id: req.params.bookingId,
        patientId: req.user._id,
      });

      if (booking) {
        await applyRefundResultToBooking({ booking, error });
      }
    }

    return res.status(500).json({ message: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  try {
    const stripeClient = getStripeClient();

    if (!stripeWebhookSecret) {
      return res.status(500).json({
        message:
          "Stripe webhook secret is not configured. Please add STRIPE_WEBHOOK_SECRET.",
      });
    }

    const signature = req.headers["stripe-signature"];
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      stripeWebhookSecret,
    );

    if (event.type.startsWith("payment_intent.")) {
      const paymentIntent = event.data.object;
      await syncPaymentRecordFromIntent(paymentIntent, {
        lastWebhookEventId: event.id,
        lastWebhookType: event.type,
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error.message);
    return res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
};
