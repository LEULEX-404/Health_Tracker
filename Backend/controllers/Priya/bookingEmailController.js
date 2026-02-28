import nodemailer from "nodemailer";
import EmailLog from "../../models/Priya/EmailLog.js";

function getTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    return null;
}

/**
 * Send a real "booking received" email to the patient when they confirm a booking.
 * Call this after creating an appointment. Returns { sent: true } or { sent: false, error }.
 */
export const sendBookingReceivedToPatient = async (apt) => {
    const to = apt.patientEmail || apt.email;
    if (!to || !to.trim()) return { sent: false, error: 'No patient email' };
    const name = apt.patientName || apt.fullName || 'Patient';
    const doctorName = apt.doctor || '';
    const date = apt.date || '';
    const time = apt.time || '';
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('Booking email not sent (EMAIL not configured). Set EMAIL_USER and EMAIL_PASSWORD in .env for real emails.');
        return { sent: false, error: 'SMTP not configured' };
    }
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"HealthSync" <no-reply@healthsync.com>',
        to: to.trim(),
        subject: 'Booking Successful - HealthSync',
        text: `Dear ${name},\n\nBooking Successful. After booking confirmed by doctor we will send the details to your email.\n\nYour appointment request: ${doctorName} – ${date} at ${time}.\n\nThank you for choosing HealthSync.\n\nBest regards,\nHealthSync Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Booking Successful</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>Booking Successful. After booking confirmed by doctor we will send the details to your email.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                </div>
                <p>Thank you for choosing HealthSync.</p>
                <p>Best regards,<br>HealthSync Team</p>
            </div>
        `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Booking email sent to %s: %s', to, info.messageId);
        try {
            await EmailLog.create({
                to: to.trim(),
                subject: mailOptions.subject,
                status: 'sent',
                messageId: info.messageId || '',
                meta: { doctorName, date, time }
            });
        } catch (logErr) {
            console.warn('Failed to write email log:', logErr.message);
        }
        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error('Error sending booking email:', err);
        try {
            await EmailLog.create({
                to: to.trim(),
                subject: mailOptions.subject,
                status: 'failed',
                error: err.message,
                meta: { doctorName, date, time }
            });
        } catch (logErr) {
            console.warn('Failed to write email log:', logErr.message);
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
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"HealthSync" <no-reply@healthsync.com>',
            to: email,
            subject: 'Booking Successful - HealthSync',
            text: `Dear ${fullName || 'Patient'},\n\nBooking Successful. After booking confirmed by doctor we will send the details to your email.\n\nYour appointment: ${doctorName} – ${preferredDate} at ${timeSlot}.\n\nThank you for choosing HealthSync.\n\nBest regards,\nHealthSync Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Booking Successful</h2>
                    <p>Dear <strong>${fullName || 'Patient'}</strong>,</p>
                    <p>Booking Successful. After booking confirmed by doctor we will send the details to your email.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${preferredDate}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot}</p>
                    </div>
                    <p>Thank you for choosing HealthSync.</p>
                    <p>Best regards,<br>HealthSync Team</p>
                </div>
            `,
        };

        if (transporter) {
            const info = await transporter.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
            try {
                await EmailLog.create({
                    to: email.trim(),
                    subject: mailOptions.subject,
                    status: 'sent',
                    messageId: info.messageId || '',
                    meta: { doctorName, preferredDate, timeSlot }
                });
            } catch (logErr) {
                console.warn('Failed to write email log:', logErr.message);
            }
            res.status(200).json({ message: "Email sent successfully", success: true });
        } else {
            console.warn("EMAIL not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to send real emails.");
            try {
                await EmailLog.create({
                    to: email.trim(),
                    subject: mailOptions.subject,
                    status: 'failed',
                    error: 'EMAIL not configured',
                    meta: { doctorName, preferredDate, timeSlot }
                });
            } catch (logErr) {
                console.warn('Failed to write email log:', logErr.message);
            }
            res.status(200).json({
                message: "Email not sent (SMTP not configured)",
                success: false,
                warning: "EMAIL credentials missing in .env"
            });
        }
    } catch (error) {
        console.error("Error sending email:", error);
        try {
            await EmailLog.create({
                to: email.trim(),
                subject: 'Booking Successful - HealthSync',
                status: 'failed',
                error: error.message,
                meta: { doctorName, preferredDate, timeSlot }
            });
        } catch (logErr) {
            console.warn('Failed to write email log:', logErr.message);
        }
        res.status(500).json({ message: "Failed to send email", error: error.message });
    }
};

/**
 * Send status update email for appointment confirmation/cancellation.
 */
export const sendBookingStatusToPatient = async (apt, status) => {
    const to = apt.patientEmail || apt.email;
    if (!to || !to.trim()) return { sent: false, error: 'No patient email' };
    const name = apt.patientName || apt.fullName || 'Patient';
    const doctorName = apt.doctor || '';
    const date = apt.date || '';
    const time = apt.time || '';
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('Status email not sent (EMAIL not configured). Set EMAIL_USER and EMAIL_PASSWORD in .env for real emails.');
        return { sent: false, error: 'EMAIL not configured' };
    }

    const subject = `Appointment ${status} - HealthSync`;
    const text = `Dear ${name},\n\nYour appointment has been ${status.toLowerCase()}.\n\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\n\nThank you,\nHealthSync Team`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Appointment ${status}</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your appointment has been <strong>${status.toLowerCase()}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            </div>
            <p>Thank you,<br>HealthSync Team</p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"HealthSync" <no-reply@healthsync.com>',
            to: to.trim(),
            subject,
            text,
            html,
        });
        console.log('Status email sent to %s: %s', to, info.messageId);
        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error('Error sending status email:', err);
        return { sent: false, error: err.message };
    }
};


export default {
    sendBookingReceivedToPatient,
    sendBookingSuccessEmail,
    sendBookingStatusToPatient
};