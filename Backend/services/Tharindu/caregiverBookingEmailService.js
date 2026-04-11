import nodemailer from "nodemailer";

import config from "../../config.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getTransporter = () => {
  if (!config.EMAIL_USER || !config.EMAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    service: config.EMAIL_HOST.includes("gmail") ? "gmail" : undefined,
    host: config.EMAIL_HOST.includes("gmail") ? undefined : config.EMAIL_HOST,
    port: Number(config.EMAIL_PORT),
    secure: Number(config.EMAIL_PORT) === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      family: 4,
    },
  });
};

const formatUserName = (user) => {
  if (!user) {
    return "User";
  }

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.name || "User";
};

const formatBookingDate = (date) =>
  new Date(date).toLocaleDateString("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatBookingTime = (booking) =>
  booking.endTime ? `${booking.startTime} - ${booking.endTime}` : booking.startTime;

const buildTextMessage = ({ greetingName, intro, details, closing }) => {
  const detailLines = details.map((detail) => `${detail.label}: ${detail.value}`).join("\n");

  return [
    `Dear ${greetingName},`,
    "",
    intro,
    "",
    detailLines,
    "",
    closing,
    "",
    "Healthcare Tracker Team",
  ].join("\n");
};

const buildHtmlMessage = ({
  title,
  badge,
  accentColor,
  greetingName,
  intro,
  details,
  closing,
  ctaLabel,
  ctaUrl,
}) => {
  const detailRows = details
    .map(
      (detail) => `
        <tr>
          <td style="padding: 12px 0; color: #64748b; font-weight: 600; width: 38%;">${escapeHtml(detail.label)}</td>
          <td style="padding: 12px 0; color: #0f172a; font-weight: 700;">${escapeHtml(detail.value)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <div style="padding: 36px 40px; background: linear-gradient(135deg, ${accentColor} 0%, #0f766e 100%); color: #ffffff;">
            <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
              ${escapeHtml(badge)}
            </div>
            <h1 style="margin: 18px 0 10px; font-size: 30px; line-height: 1.2;">${escapeHtml(title)}</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.92);">
              ${escapeHtml(intro)}
            </p>
          </div>

          <div style="padding: 36px 40px;">
            <p style="margin: 0 0 18px; font-size: 16px; color: #334155;">Dear <strong>${escapeHtml(greetingName)}</strong>,</p>
            <div style="padding: 22px 24px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                ${detailRows}
              </table>
            </div>

            <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #475569;">
              ${escapeHtml(closing)}
            </p>

            <div style="margin-top: 28px;">
              <a href="${escapeHtml(ctaUrl)}" style="display: inline-block; padding: 14px 22px; border-radius: 12px; background: ${accentColor}; color: #ffffff; text-decoration: none; font-weight: 700;">
                ${escapeHtml(ctaLabel)}
              </a>
            </div>
          </div>

          <div style="padding: 20px 40px; background: #f8fafc; color: #64748b; font-size: 13px; line-height: 1.7; border-top: 1px solid #e2e8f0;">
            This is an automated Healthcare Tracker message about your caregiver appointment activity.
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    return { sent: false, error: "Recipient email is missing." };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      `[Caregiver Booking Email] SMTP not configured. Skipping email to ${to}.`
    );
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Caregiver Booking Email] Failed to send email to ${to}:`, error);
    return { sent: false, error: error.message };
  }
};

const sendTemplateEmail = async ({
  to,
  subject,
  title,
  badge,
  accentColor,
  greetingName,
  intro,
  details,
  closing,
  ctaLabel,
  ctaUrl,
}) =>
  sendEmail({
    to,
    subject,
    html: buildHtmlMessage({
      title,
      badge,
      accentColor,
      greetingName,
      intro,
      details,
      closing,
      ctaLabel,
      ctaUrl,
    }),
    text: buildTextMessage({
      greetingName,
      intro,
      details,
      closing,
    }),
  });

export const sendBookingRequestEmails = async ({ booking, patient, caregiver }) => {
  const patientName = formatUserName(patient);
  const caregiverName = formatUserName(caregiver);
  const bookingDate = formatBookingDate(booking.date);
  const bookingTime = formatBookingTime(booking);

  return Promise.allSettled([
    sendTemplateEmail({
      to: patient?.email,
      subject: "Healthcare Booking Confirmation",
      title: "Caregiver Appointment Requested",
      badge: "Booking Requested",
      accentColor: "#0f766e",
      greetingName: patientName,
      intro: "Your caregiver appointment request has been received successfully.",
      details: [
        { label: "Patient", value: patientName },
        { label: "Caregiver", value: caregiverName },
        { label: "Booked Date", value: bookingDate },
        { label: "Booked Time", value: bookingTime },
        { label: "Status", value: booking.status || "Pending" },
      ],
      closing:
        "We will notify you again as soon as the caregiver reviews your request.",
      ctaLabel: "View My Bookings",
      ctaUrl: config.PATIENT_HOME_URL || config.CLIENT_URL,
    }),
    sendTemplateEmail({
      to: caregiver?.email,
      subject: "New Caregiver Appointment Request",
      title: "New Patient Booking Request",
      badge: "Action Needed",
      accentColor: "#2563eb",
      greetingName: caregiverName,
      intro: "A patient has requested a caregiver appointment and is waiting for your response.",
      details: [
        { label: "Patient", value: patientName },
        { label: "Caregiver", value: caregiverName },
        { label: "Requested Date", value: bookingDate },
        { label: "Requested Time", value: bookingTime },
        { label: "Current Status", value: booking.status || "Pending" },
      ],
      closing:
        "Please review the request from your caregiver dashboard and approve or reject it when ready.",
      ctaLabel: "Open Dashboard",
      ctaUrl: config.CLIENT_URL,
    }),
  ]);
};

export const sendBookingStatusEmail = async ({ booking, patient, caregiver, status }) => {
  const normalizedStatus = String(status || booking.status || "").toLowerCase();
  const patientName = formatUserName(patient);
  const caregiverName = formatUserName(caregiver);
  const bookingDate = formatBookingDate(booking.date);
  const bookingTime = formatBookingTime(booking);

  const statusConfig = {
    approved: {
      subject: "Healthcare Booking Confirmed",
      title: "Your Booking Is Confirmed",
      badge: "Approved",
      accentColor: "#15803d",
      intro: "Your caregiver has approved the appointment request.",
      closing:
        "Thank you for booking with Healthcare Tracker. We look forward to supporting your care journey.",
    },
    rejected: {
      subject: "Healthcare Booking Update",
      title: "Your Booking Request Was Rejected",
      badge: "Rejected",
      accentColor: "#dc2626",
      intro: "We are sorry, but your caregiver appointment request could not be accepted.",
      closing:
        "We apologize for the inconvenience. Please choose another caregiver or try a different date and time.",
    },
    completed: {
      subject: "Healthcare Booking Completed",
      title: "Your Appointment Was Marked Completed",
      badge: "Completed",
      accentColor: "#7c3aed",
      intro: "Your caregiver has marked this appointment as completed.",
      closing: "We hope your appointment went well. Thank you for using Healthcare Tracker.",
    },
  };

  const template = statusConfig[normalizedStatus];
  if (!template) {
    return [];
  }

  const refundNote =
    normalizedStatus === "rejected" && booking?.refundProtectionSelected
      ? " Because refund protection was added to this booking, you can request your refund from the caregiver bookings page."
      : "";

  return Promise.allSettled([
    sendTemplateEmail({
      to: patient?.email,
      subject: template.subject,
      title: template.title,
      badge: template.badge,
      accentColor: template.accentColor,
      greetingName: patientName,
      intro: template.intro,
      details: [
        { label: "Patient", value: patientName },
        { label: "Caregiver", value: caregiverName },
        { label: "Booked Date", value: bookingDate },
        { label: "Booked Time", value: bookingTime },
        { label: "Status", value: status },
      ],
      closing: `${template.closing}${refundNote}`,
      ctaLabel: "View Appointment",
      ctaUrl: config.PATIENT_HOME_URL || config.CLIENT_URL,
    }),
  ]);
};

export const sendPatientCancellationEmails = async ({ booking, patient, caregiver }) => {
  const patientName = formatUserName(patient);
  const caregiverName = formatUserName(caregiver);
  const bookingDate = formatBookingDate(booking.date);
  const bookingTime = formatBookingTime(booking);
  const patientClosing = booking?.refundProtectionSelected
    ? "If you still need assistance, you can place a new caregiver booking request at any time. Since refund protection was added, you can now request your refund from the caregiver bookings page."
    : "If you still need assistance, you can place a new caregiver booking request at any time.";

  return Promise.allSettled([
    sendTemplateEmail({
      to: patient?.email,
      subject: "Healthcare Booking Cancelled",
      title: "Your Booking Has Been Cancelled",
      badge: "Cancelled",
      accentColor: "#b45309",
      greetingName: patientName,
      intro: "Your caregiver appointment request has been cancelled successfully.",
      details: [
        { label: "Patient", value: patientName },
        { label: "Caregiver", value: caregiverName },
        { label: "Booked Date", value: bookingDate },
        { label: "Booked Time", value: bookingTime },
        { label: "Status", value: "Cancelled" },
      ],
      closing: patientClosing,
      ctaLabel: "Book Again",
      ctaUrl: config.PATIENT_HOME_URL || config.CLIENT_URL,
    }),
    sendTemplateEmail({
      to: caregiver?.email,
      subject: "Caregiver Booking Cancelled by Patient",
      title: "Patient Cancelled a Booking Request",
      badge: "Cancelled",
      accentColor: "#b45309",
      greetingName: caregiverName,
      intro: "The patient has cancelled the caregiver appointment request before approval.",
      details: [
        { label: "Patient", value: patientName },
        { label: "Caregiver", value: caregiverName },
        { label: "Booked Date", value: bookingDate },
        { label: "Booked Time", value: bookingTime },
        { label: "Status", value: "Cancelled" },
      ],
      closing:
        "No further action is needed for this request. Thank you for keeping your schedule up to date.",
      ctaLabel: "Open Dashboard",
      ctaUrl: config.CLIENT_URL,
    }),
  ]);
};
