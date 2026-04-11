import Payment from "../../models/Tharindu/Payment.js";

export const CAREGIVER_SESSION_BASE_AMOUNT = 525000;
export const CAREGIVER_REFUND_PROTECTION_FEE = 50000;

export const REFUND_STATUSES = {
  NOT_APPLICABLE: "not_applicable",
  LOCKED: "locked",
  AVAILABLE: "available",
  PENDING: "pending",
  REFUNDED: "refunded",
  FAILED: "failed",
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

const toInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
};

export const calculateCaregiverBookingAmounts = (refundProtectionSelected) => {
  const selected = Boolean(refundProtectionSelected);
  const baseAmount = CAREGIVER_SESSION_BASE_AMOUNT;
  const refundProtectionFee = selected ? CAREGIVER_REFUND_PROTECTION_FEE : 0;
  const totalAmount = baseAmount + refundProtectionFee;

  return {
    baseAmount,
    refundProtectionFee,
    totalAmount,
    refundableAmount: selected ? baseAmount : 0,
  };
};

export const hydratePaymentRefundDetails = (payment) => {
  const metadata = payment?.metadata || {};
  const refundProtectionSelected =
    Boolean(payment?.refundProtectionSelected) ||
    toBoolean(metadata.refundProtectionSelected);
  const baseAmount = toInteger(
    payment?.baseAmount,
    toInteger(metadata.baseAmount, CAREGIVER_SESSION_BASE_AMOUNT),
  );
  const refundProtectionFee = toInteger(
    payment?.refundProtectionFee,
    toInteger(
      metadata.refundProtectionFee,
      refundProtectionSelected ? CAREGIVER_REFUND_PROTECTION_FEE : 0,
    ),
  );
  const refundableAmount = refundProtectionSelected
    ? toInteger(
        payment?.refundableAmount,
        toInteger(metadata.refundableAmount, baseAmount),
      )
    : 0;
  const refundStatus =
    payment?.refundStatus ||
    (refundProtectionSelected
      ? REFUND_STATUSES.LOCKED
      : REFUND_STATUSES.NOT_APPLICABLE);

  return {
    refundProtectionSelected,
    baseAmount,
    refundProtectionFee,
    refundableAmount,
    totalAmount: toInteger(payment?.amount, baseAmount + refundProtectionFee),
    refundStatus,
  };
};

export const attachPaymentRecordToBooking = async ({
  booking,
  userId,
  paymentIntentId,
}) => {
  if (!paymentIntentId) {
    throw new Error("A verified payment is required before creating a booking.");
  }

  const payment = await Payment.findOne({
    paymentIntentId,
    userId,
  });

  if (!payment) {
    throw new Error("Payment record not found for this booking.");
  }

  if (payment.status !== "succeeded") {
    throw new Error("Payment must be successful before the booking can be created.");
  }

  if (
    payment.bookingId &&
    payment.bookingId.toString() !== booking._id.toString()
  ) {
    throw new Error("This payment has already been used for another booking.");
  }

  const refundDetails = hydratePaymentRefundDetails(payment);

  booking.paymentIntentId = payment.paymentIntentId;
  booking.paymentRecordId = payment._id;
  booking.baseAmount = refundDetails.baseAmount;
  booking.totalPaidAmount = refundDetails.totalAmount;
  booking.refundProtectionSelected = refundDetails.refundProtectionSelected;
  booking.refundProtectionFee = refundDetails.refundProtectionFee;
  booking.refundableAmount = refundDetails.refundableAmount;
  booking.refundStatus = refundDetails.refundStatus;

  payment.bookingId = booking._id;
  payment.baseAmount = refundDetails.baseAmount;
  payment.refundProtectionSelected = refundDetails.refundProtectionSelected;
  payment.refundProtectionFee = refundDetails.refundProtectionFee;
  payment.refundableAmount = refundDetails.refundableAmount;
  payment.refundStatus = refundDetails.refundStatus;
  payment.metadata = {
    ...(payment.metadata || {}),
    bookingId: booking._id.toString(),
  };

  await payment.save();
  return payment;
};

export const unlockRefundForBooking = async (booking) => {
  const nextStatus = booking.refundProtectionSelected
    ? REFUND_STATUSES.AVAILABLE
    : REFUND_STATUSES.NOT_APPLICABLE;

  booking.refundStatus = nextStatus;
  booking.refundFailureMessage = undefined;
  await booking.save();

  if (booking.paymentRecordId) {
    await Payment.findByIdAndUpdate(booking.paymentRecordId, {
      $set: {
        refundStatus: nextStatus,
        refundFailureMessage: undefined,
      },
    });
  }

  return booking;
};

const mapStripeRefundStatus = (stripeStatus) => {
  switch (stripeStatus) {
    case "succeeded":
      return REFUND_STATUSES.REFUNDED;
    case "failed":
    case "canceled":
      return REFUND_STATUSES.FAILED;
    default:
      return REFUND_STATUSES.PENDING;
  }
};

export const applyRefundResultToBooking = async ({ booking, refund, error }) => {
  const nextStatus = error
    ? REFUND_STATUSES.FAILED
    : mapStripeRefundStatus(refund?.status);

  const updates = {
    refundStatus: nextStatus,
    refundId: refund?.id || booking.refundId,
    refundAmount: refund?.amount || booking.refundAmount || booking.refundableAmount,
    refundRequestedAt: new Date(),
    refundedAt:
      nextStatus === REFUND_STATUSES.REFUNDED ? new Date() : booking.refundedAt,
    refundFailureMessage: error?.message || undefined,
  };

  Object.assign(booking, updates);
  await booking.save();

  if (booking.paymentRecordId) {
    await Payment.findByIdAndUpdate(booking.paymentRecordId, {
      $set: updates,
    });
  }

  return booking;
};

export const getRefundEligibilityMessage = (booking) => {
  if (!booking.refundProtectionSelected) {
    return "You did not add refund protection to this booking, so it is not eligible for a refund.";
  }

  if (booking.refundStatus === REFUND_STATUSES.REFUNDED) {
    return "This booking has already been refunded.";
  }

  if (booking.refundStatus === REFUND_STATUSES.PENDING) {
    return "Your refund request is already being processed.";
  }

  if (!["Rejected", "Cancelled"].includes(booking.status)) {
    return "Refunds are only available after caregiver rejection or when you cancel before approval.";
  }

  return "";
};
