import { EventEmitter } from "events";
import nodemailer from "nodemailer";
import Nexmo from "nexmo";

import Notification from "../../models/Tharindu/Notification.js";
import config from "../../config.js";

/**
 * Central event emitter so Socket.IO or other layers
 * can subscribe and push real-time notifications.
 */
export const notificationEvents = new EventEmitter();

const buildMessageForAlert = (alert) => {
  return `Alert for ${alert.parameter}: value ${alert.value} (severity: ${alert.severity})`;
};

/**
 * Generates a professional HTML email template for health alerts.
 */
const getHtmlTemplate = (alert) => {
  const severityColors = {
    Critical: "#d9534f", // Red
    High: "#f0ad4e",     // Orange
    Medium: "#5bc0de",   // Blue
    Low: "#5cb85c",      // Green
  };

  const themeColor = severityColors[alert.severity] || "#5bc0de";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: ${themeColor}; color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; background-color: #ffffff; }
        .alert-box { background-color: #f9f9f9; border-left: 5px solid ${themeColor}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .vital-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .vital-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #666; width: 40%; }
        .value { font-weight: bold; color: #333; font-size: 1.1em; }
        .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; background-color: ${themeColor}; font-size: 0.85em; text-transform: uppercase; }
        .footer { background-color: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 0.85em; }
        .btn { display: inline-block; padding: 12px 25px; background-color: ${themeColor}; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">Health Alert Notification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We have detected an abnormal reading in your health data that requires your attention.</p>
          
          <div class="alert-box">
            <span class="severity-badge">${alert.severity} Alert</span>
            <table class="vital-table">
              <tr>
                <td class="label">Vital Sign:</td>
                <td class="value">${alert.parameter}</td>
              </tr>
              <tr>
                <td class="label">Measured Value:</td>
                <td class="value">${alert.value}</td>
              </tr>
              <tr>
                <td class="label">Status:</td>
                <td class="value">${alert.severity} Deviation</td>
              </tr>
            </table>
          </div>
          
          <p>Please review your dashboard and consult with your healthcare provider if you feel unwell or if these readings persist.</p>
          
          <div style="text-align: center;">
            <a href="${config.CLIENT_URL}/home" class="btn">View My Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>Healthcare Tracker &copy; 2026. This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const createNotification = async (userId, type, message, meta = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    message,
    meta,
  });

  notificationEvents.emit("notification", notification);
  return notification;
};

// Real email/SMS senders using env config
// Reusable transporter instance to avoid "Too many login attempts" (Gmail rate-limiting)
const transporter = nodemailer.createTransport({
  pool: true, // Use connection pooling
  maxConnections: 1, // Limit to 1 connection to avoid multiple login spikes
  service: config.EMAIL_HOST.includes('gmail') ? 'gmail' : undefined,
  host: config.EMAIL_HOST.includes('gmail') ? undefined : config.EMAIL_HOST,
  port: Number(config.EMAIL_PORT),
  secure: Number(config.EMAIL_PORT) === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (notification) => {
  console.log(`[Email] Attempting to send to: ${notification.meta?.userEmail || config.EMAIL_USER}`);

  // Use professional HTML template if alert info is present
  const htmlContent = notification.meta?.alertInfo
    ? getHtmlTemplate(notification.meta.alertInfo)
    : `<p>${notification.message}</p>`;

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: notification.meta?.userEmail || config.EMAIL_USER,
    subject: `Health Tracker: ${notification.meta?.alertInfo?.severity || "Alert"} Priority Notification`,
    text: notification.message,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("[Email] ✅ Sent: %s", info.messageId);
  return { provider: "nodemailer", messageId: info.messageId };
};

const sendSMS = async (notification) => {
  console.log(`[SMS] Attempting to send to: ${notification.meta?.userPhone || "N/A"}`);

  const nexmo = new Nexmo({
    apiKey: config.VONAGE_API_KEY,
    apiSecret: config.VONAGE_API_SECRET
  });

  const from = config.VONAGE_BRAND_NAME;
  const to = notification.meta?.userPhone;
  const text = notification.message;

  if (!to || to === "N/A") {
    throw new Error("No phone number provided");
  }

  // Ensure 'to' is in correct format (remove leading +, Nexmo needs it gone for some destinations)
  const formattedTo = to.startsWith('+') ? to.substring(1) : to;

  return new Promise((resolve, reject) => {
    nexmo.message.sendSms(from, formattedTo, text, (err, responseData) => {
      if (err) {
        console.error("[SMS] ❌ Nexmo Error:", err);
        return reject(err);
      }
      if (responseData.messages[0].status === "0") {
        console.log("[SMS] ✅ Sent via Nexmo:", responseData.messages[0]['message-id']);
        resolve({ provider: "nexmo", messageId: responseData.messages[0]['message-id'] });
      } else {
        const errorMsg = responseData.messages[0]['error-text'];
        console.error(`[SMS] ❌ Nexmo Delivery failure: ${errorMsg}`);
        reject(new Error(errorMsg));
      }
    });
  });
};

const finalizeDelivery = async (notification, channelResponse, error) => {
  if (error) {
    notification.deliveryStatus = "failed";
    notification.meta = {
      ...notification.meta,
      channelResponse: { error: error.message },
    };
  } else {
    notification.deliveryStatus = "sent";
    notification.sentAt = new Date();
    notification.meta = {
      ...notification.meta,
      channelResponse,
    };
  }
  await notification.save();
  return notification;
};

export const sendNotification = async (userId, type, message, meta = {}) => {
  const notification = await createNotification(userId, type, message, meta);

  try {
    let response;
    if (type === "email") {
      response = await sendEmail(notification);
    } else if (type === "sms") {
      response = await sendSMS(notification);
    } else {
      console.log(`[${type}] ✅ Confirmation: ${notification.message}`);
      response = { provider: "in-app" };
    }

    return finalizeDelivery(notification, response);
  } catch (err) {
    console.error(`[${type}] ❌ Delivery failure:`, err.message);
    return finalizeDelivery(notification, null, err);
  }

};

export const notifyOnNewAlert = async (alert) => {
  const baseMessage = buildMessageForAlert(alert);
  console.log(`[Notification] 🔔 New alert for user ${alert.userId}: ${alert.parameter} (${alert.severity}). Target Email: ${alert.userEmail || "N/A"}`);

  // Always create in-app notification + toast
  await sendNotification(alert.userId, "inApp", baseMessage, {
    alertId: alert._id,
  });
  await sendNotification(alert.userId, "toast", baseMessage, {
    alertId: alert._id,
  });

  // High/Critical also trigger email + SMS channels
  if (alert.severity === "High" || alert.severity === "Critical") {
    await sendNotification(alert.userId, "email", baseMessage, {
      alertId: alert._id,
      userEmail: alert.userEmail,
      alertInfo: alert, // Passing full alert for UI/UX
    });
    await sendNotification(alert.userId, "sms", baseMessage, {
      alertId: alert._id,
      userPhone: alert.userPhone,
    });
  }
};

export const notifyOnEscalationCandidate = async (alert) => {
  const message = `⚠️ Escalation: repeated abnormal readings for ${alert.parameter} (value: ${alert.value}).`;
  console.log(`[Escalation] 🚨 Repeating triggers for user ${alert.userId}: ${alert.parameter}. Escalating to SMS/Email.`);

  // Always create in-app notification + toast for escalations
  await sendNotification(alert.userId, "inApp", message, {
    alertId: alert._id,
  });
  await sendNotification(alert.userId, "toast", message, {
    alertId: alert._id,
  });

  await sendNotification(alert.userId, "email", message, {
    alertId: alert._id,
    userEmail: alert.userEmail,
    alertInfo: alert, // Passing full alert for UI/UX
  });
  await sendNotification(alert.userId, "sms", message, {
    alertId: alert._id,
    userPhone: alert.userPhone,
  });
};

export const notifyOnAlertResolved = async (alert) => {
  const message = `✅ Alert resolved for ${alert.parameter} at ${alert.resolvedAt?.toISOString()}.`;

  await sendNotification(alert.userId, "inApp", message, {
    alertId: alert._id,
  });
  await sendNotification(alert.userId, "toast", message, {
    alertId: alert._id,
  });
};

/*
    sendEmail()
    sendSMS()
    emitSocketNotification()
*/
