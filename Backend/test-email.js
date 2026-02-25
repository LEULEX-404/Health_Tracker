import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testEmail() {
    console.log("Testing Email with Gmail Service helper...");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
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
