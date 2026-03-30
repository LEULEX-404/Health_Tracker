import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EmailLog from "../../models/Priya/EmailLog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function createBookingEmailContent({ name, doctorName, date, time }) {
    const subject = "Doctor Appointment Request Received - HealthSync";
    const text = `Dear ${name},\n\nYour doctor booking request has been received successfully.\n\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\n\nWe will send another email after the admin confirms or cancels your appointment.\n\nThank you for choosing HealthSync.\n\nBest regards,\nHealthSync Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Doctor Appointment Request Received</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your doctor booking request has been received successfully.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            </div>
            <p>We will send another email after the admin confirms or cancels your appointment.</p>
            <p>Thank you for choosing HealthSync.</p>
            <p>Best regards,<br>HealthSync Team</p>
        </div>
    `;

    return { subject, text, html };
}

function createStatusEmailContent({ name, doctorName, date, time, status }) {
    const normalizedStatus = String(status || "").trim();
    const statusLower = normalizedStatus.toLowerCase();
    const subject = `Appointment ${normalizedStatus} - HealthSync`;
    const text = `Dear ${name},\n\nYour appointment has been ${statusLower} by the admin.\n\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\n\nThank you,\nHealthSync Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Appointment ${normalizedStatus}</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your appointment has been <strong>${statusLower}</strong> by the admin.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            </div>
            <p>Thank you,<br>HealthSync Team</p>
        </div>
    `;

    return { subject, text, html };
}

function getFromAddress() {
    const senderEmail = (process.env.EMAIL_USER || process.env.EMAIL_FROM || "").trim();
    const senderName = (process.env.EMAIL_FROM_NAME || "HealthSync").trim();

    if (!senderEmail) {
        return '"HealthSync" <no-reply@healthsync.com>';
    }

    return `"${senderName}" <${senderEmail}>`;
}

function getEmailConfig() {
    const host = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
    const port = Number(process.env.EMAIL_PORT) || 587;
    const user = (process.env.EMAIL_USER || "").trim();
    const pass = (process.env.EMAIL_PASSWORD || "").trim();
    const secure = process.env.EMAIL_SECURE === "true" || port === 465;
    const isGmail = /gmail/i.test(host);

    return { host, port, user, pass, secure, isGmail };
}

function buildTransporter({ host, port, user, pass, secure, service }) {
    return nodemailer.createTransport({
        service,
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        requireTLS: service ? undefined : !secure,
        tls: {
            rejectUnauthorized: false,
            servername: host || undefined,
        },
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 45000,
    });
}

function getTransporter() {
    const { host, port, user, pass, secure } = getEmailConfig();

    if (!user || !pass) return null;

    return buildTransporter({
        host,
        port,
        user,
        pass,
        secure,
    });
}

function getFallbackTransporter() {
    const { host, user, pass, isGmail } = getEmailConfig();

    if (!user || !pass) return null;

    return buildTransporter({
        host: isGmail ? undefined : host,
        port: isGmail ? undefined : 465,
        user,
        pass,
        secure: true,
        service: isGmail ? "gmail" : undefined,
    });
}

function isTransientSocketError(err) {
    const message = String(err?.message || "").toLowerCase();
    const code = String(err?.code || "").toUpperCase();

    return (
        message.includes("unexpected socket close") ||
        message.includes("connection closed") ||
        message.includes("timeout") ||
        code === "ECONNECTION" ||
        code === "ETIMEDOUT" ||
        code === "ESOCKET"
    );
}

async function sendMailWithRetry(transporter, mailOptions) {
    try {
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        if (!isTransientSocketError(err)) throw err;

        const retryTransporter = getTransporter();
        if (!retryTransporter) throw err;

        try {
            return await retryTransporter.sendMail(mailOptions);
        } catch (retryErr) {
            if (!isTransientSocketError(retryErr)) throw retryErr;

            const fallbackTransporter = getFallbackTransporter();
            if (!fallbackTransporter) throw retryErr;

            return await fallbackTransporter.sendMail(mailOptions);
        }
    }
}

export const sendBookingReceivedToPatient = async (apt) => {
    const to = apt.patientEmail || apt.email;
    if (!to || !to.trim()) return { sent: false, error: "No patient email" };

    const name = apt.patientName || apt.fullName || "Patient";
    const doctorName = apt.doctor || "";
    const date = apt.date || "";
    const time = apt.time || "";
    const { subject, text, html } = createBookingEmailContent({
        name,
        doctorName,
        date,
        time,
    });
    const transporter = getTransporter();

    if (!transporter) {
        console.warn("Booking email not sent (EMAIL not configured). Set EMAIL_USER and EMAIL_PASSWORD in .env for real emails.");
        return { sent: false, error: "SMTP not configured" };
    }

    const mailOptions = {
        from: getFromAddress(),
        to: to.trim(),
        subject,
        text,
        html,
    };

    try {
        const info = await sendMailWithRetry(transporter, mailOptions);
        console.log("Booking email sent to %s: %s", to, info.messageId);

        try {
            await EmailLog.create({
                to: to.trim(),
                subject,
                status: "sent",
                messageId: info.messageId || "",
                meta: { doctorName, date, time },
            });
        } catch (logErr) {
            console.warn("Failed to write email log:", logErr.message);
        }

        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("Error sending booking email:", err);

        try {
            await EmailLog.create({
                to: to.trim(),
                subject,
                status: "failed",
                error: err.message,
                meta: { doctorName, date, time },
            });
        } catch (logErr) {
            console.warn("Failed to write email log:", logErr.message);
        }

        return { sent: false, error: err.message };
    }
};

export const sendBookingSuccessEmail = async (req, res) => {
    const { email, fullName, doctorName, preferredDate, timeSlot } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const transporter = getTransporter();
        const { subject, text, html } = createBookingEmailContent({
            name: fullName || "Patient",
            doctorName,
            date: preferredDate,
            time: timeSlot,
        });
        const mailOptions = {
            from: getFromAddress(),
            to: email.trim(),
            subject,
            text,
            html,
        };

        if (transporter) {
            const info = await sendMailWithRetry(transporter, mailOptions);
            console.log("Message sent: %s", info.messageId);

            try {
                await EmailLog.create({
                    to: email.trim(),
                    subject,
                    status: "sent",
                    messageId: info.messageId || "",
                    meta: { doctorName, preferredDate, timeSlot },
                });
            } catch (logErr) {
                console.warn("Failed to write email log:", logErr.message);
            }

            return res.status(200).json({ message: "Email sent successfully", success: true });
        }

        console.warn("EMAIL not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to send real emails.");

        try {
            await EmailLog.create({
                to: email.trim(),
                subject,
                status: "failed",
                error: "EMAIL not configured",
                meta: { doctorName, preferredDate, timeSlot },
            });
        } catch (logErr) {
            console.warn("Failed to write email log:", logErr.message);
        }

        return res.status(200).json({
            message: "Email not sent (SMTP not configured)",
            success: false,
            warning: "EMAIL credentials missing in .env",
        });
    } catch (error) {
        console.error("Error sending email:", error);

        try {
            await EmailLog.create({
                to: email.trim(),
                subject: "Doctor Appointment Request Received - HealthSync",
                status: "failed",
                error: error.message,
                meta: { doctorName, preferredDate, timeSlot },
            });
        } catch (logErr) {
            console.warn("Failed to write email log:", logErr.message);
        }

        return res.status(500).json({ message: "Failed to send email", error: error.message });
    }
};

export const sendBookingStatusToPatient = async (apt, status) => {
    const to = apt.patientEmail || apt.email;
    if (!to || !to.trim()) return { sent: false, error: "No patient email" };

    const name = apt.patientName || apt.fullName || "Patient";
    const doctorName = apt.doctor || "";
    const date = apt.date || "";
    const time = apt.time || "";
    const { subject, text, html } = createStatusEmailContent({ name, doctorName, date, time, status });
    const transporter = getTransporter();

    if (!transporter) {
        console.warn("Status email not sent (EMAIL not configured). Set EMAIL_USER and EMAIL_PASSWORD in .env for real emails.");
        return { sent: false, error: "EMAIL not configured" };
    }

    try {
        const info = await sendMailWithRetry(transporter, {
            from: getFromAddress(),
            to: to.trim(),
            subject,
            text,
            html,
        });
        console.log("Status email sent to %s: %s", to, info.messageId);

        try {
            await EmailLog.create({
                to: to.trim(),
                subject,
                status: "sent",
                messageId: info.messageId || "",
                meta: { doctorName, date, time, appointmentStatus: status },
            });
        } catch (logErr) {
            console.warn("Failed to write status email log:", logErr.message);
        }

        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("Error sending status email:", err);

        try {
            await EmailLog.create({
                to: to.trim(),
                subject,
                status: "failed",
                error: err.message,
                meta: { doctorName, date, time, appointmentStatus: status },
            });
        } catch (logErr) {
            console.warn("Failed to write status email log:", logErr.message);
        }

        return { sent: false, error: err.message };
    }
};

export default {
    sendBookingReceivedToPatient,
    sendBookingSuccessEmail,
    sendBookingStatusToPatient,
};
