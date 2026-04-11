/**
 * PulsePaymentModal.jsx
 * ---------------------------------------------------------
 * A highly reusable Stripe test-mode payment modal.
 * Can be used by any module/team member for handling secure checkouts.
 *
 * Props:
 *  - clientSecret   {string}  Stripe PaymentIntent client secret (mandatory)
 *  - title          {string}  Main title (e.g. "Secure Checkout")
 *  - subtitle       {string}  Sub title (e.g. "Caregiver Appointment Payment")
 *  - amount         {number}  Total amount in the smallest currency unit (e.g., 525000 for 5,250.00 LKR)
 *  - currency       {string}  Currency symbol or code (e.g., "LKR")
 *  - summaryTitle   {string}  Title for the summary block (e.g., "Booking Summary")
 *  - summaryItems   {array}   Array of objects: [{ icon: <LucideIcon/>, label: "Name", value: "John", highlight: false }]
 *  - onSuccess      {fn}      Called with the paymentIntent after successful payment
 *  - onCancel       {fn}      Called when the user dismisses the modal
 */

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Load Stripe outside of render cycle (singleton) ──────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ── Stripe Elements appearance (dark theme matching PulseNova) ────────────────
const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#00C897',
    colorBackground: '#1a1f2e',
    colorText: '#e2e8f0',
    colorDanger: '#f87171',
    fontFamily: '"Inter", system-ui, sans-serif',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: {
    '.Label': { color: '#94a3b8', fontWeight: '600', marginBottom: '6px' },
    '.Input': {
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: 'none',
      padding: '12px 14px',
    },
    '.Input:focus': {
      border: '1px solid #00C897',
      boxShadow: '0 0 0 3px rgba(0,200,151,0.15)',
    },
  },
};

// ── Small helper for the summary rows ─────────────────────────────────────────
function SummaryItem({ icon, label, value, highlight }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
        {icon} {label}
      </div>
      <div style={{ color: highlight ? '#00C897' : '#e2e8f0', fontWeight: highlight ? 700 : 600, fontSize: '0.92rem' }}>
        {value}
      </div>
    </div>
  );
}

// ── Inner checkout form (needs <Elements> context) ────────────────────────────
function CheckoutForm({ amount, currency, summaryTitle, summaryItems, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // stay on page for card payments
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        toast.success('Payment successful! Processing request…');
        // short delay so user sees the success state
        setTimeout(() => {
          onSuccess(paymentIntent);
        }, 1400);
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  const formattedAmount = `${new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100)} ${currency}`;

  // ── Success screen ────────────────────────────────────────────────────────
  if (succeeded) {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '1rem', padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(0,200,151,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={44} color="#00C897" />
        </motion.div>
        <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.5rem', fontWeight: 700 }}>
          Payment Confirmed!
        </h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
          Finalizing process, please wait…
        </p>
        <Loader2 size={22} color="#00C897" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      </motion.div>
    );
  }

  // ── Payment form ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Booking Summary Card */}
      {summaryItems && summaryItems.length > 0 && (
        <div style={{
          background: 'rgba(0,200,151,0.06)',
          border: '1px solid rgba(0,200,151,0.2)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {summaryTitle && (
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00C897', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {summaryTitle}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {summaryItems.map((item, idx) => (
              <SummaryItem key={idx} icon={item.icon} label={item.label} value={item.value} highlight={item.highlight} />
            ))}
          </div>
        </div>
      )}

      {/* Test Hint Banner */}
      <div style={{
        background: 'rgba(99,102,241,0.1)',
        border: '1px dashed rgba(99,102,241,0.5)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.82rem',
        color: '#a5b4fc',
      }}>
        <ShieldCheck size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Stripe Test Mode</strong> — Use card&nbsp;
          <code style={{ background: 'rgba(99,102,241,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
            4242 4242 4242 4242
          </code>
          &nbsp;· Any future expiry
        </span>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.6rem' }}>
          Card Details
        </label>
        <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          style={{
            flex: '0 0 auto',
            padding: '0.9rem 1.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: processing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={processing || !stripe}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.9rem 1.5rem',
            background: processing
              ? 'rgba(0,200,151,0.4)'
              : 'linear-gradient(135deg, #00C897, #00B4D8)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: processing ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            boxShadow: processing ? 'none' : '0 4px 20px rgba(0,200,151,0.3)',
          }}
        >
          {processing ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Processing…
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay {formattedAmount} &amp; Confirm
            </>
          )}
        </button>
      </div>

      {/* Footer trust line */}
      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem' }}>
        <Lock size={11} />
        Secured by <strong style={{ color: '#7c83f7' }}>Stripe</strong> · Encrypted end-to-end
      </div>
    </form>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function PulsePaymentModal({ clientSecret, title = "Secure Checkout", subtitle = "Complete your payment", amount = 0, currency = "LKR", summaryTitle = "Summary", summaryItems = [], onSuccess, onCancel }) {
  if (!clientSecret) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="payment-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          key="payment-modal"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)',
            border: '1px solid rgba(0,200,151,0.2)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(0,200,151,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CreditCard size={22} color="#00C897" />
              </div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.15rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{subtitle}</div>
              </div>
            </div>

            <button
              onClick={onCancel}
              aria-label="Close payment modal"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
          >
            <CheckoutForm
              amount={amount}
              currency={currency}
              summaryTitle={summaryTitle}
              summaryItems={summaryItems}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
