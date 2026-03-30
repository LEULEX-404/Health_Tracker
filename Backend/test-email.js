import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

async function testEmail() {
    console.log("Testing Email with Gmail Service helper...");
    const senderEmail = (process.env.EMAIL_USER || process.env.EMAIL_FROM || "").trim();
    const fromAddress = senderEmail
        ? `"HealthSync" <${senderEmail}>`
        : '"HealthSync" <no-reply@healthsync.com>';

    const transporter = nodemailer.createTransport({
        host: (process.env.EMAIL_HOST || 'smtp.gmail.com').trim(),
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: (process.env.EMAIL_USER || '').trim(),
            pass: (process.env.EMAIL_PASSWORD || '').trim(),
        },
        requireTLS: process.env.EMAIL_SECURE !== 'true',
        tls: {
            rejectUnauthorized: false,
            servername: (process.env.EMAIL_HOST || 'smtp.gmail.com').trim(),
        },
        family: 4,
    });

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: process.env.EMAIL_USER,
            subject: "Health Tracker: Gmail Service Test",
            text: "If you see this, the Gmail Service helper worked!",
        });
        console.log("✅ Email Sent Successfully:", info.messageId);
    } catch (error) {
        console.error("❌ Email Failed:");
        console.error(error);
    }
}

testEmail();
