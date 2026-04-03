import dotenv from 'dotenv';
import { sendGmailApiEmail } from './utils/gmailEmailSender.js';

dotenv.config();

const testEmail = async () => {
    console.log("--------------------------------------------------");
    console.log("🚀 Testing Email with Google Gmail REST API (Pure HTTP)...");
    console.log("--------------------------------------------------");

    const testRecipient = process.env.EMAIL_USER || "miyurut20@gmail.com";
    const subject = "🧪 Health Tracker: Gmail REST API FINAL Success";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Gmail REST API Authentication Successful!</h2>
            <p>This is the final test email to verify that your Health Tracker application can send emails from Render using the official Google Gmail REST API via Port 443.</p>
            <p><strong>Status:</strong> <span style="color: green;">Authenticated via OAuth2 (HTTP)</span></p>
            <p><strong>Success!</strong> This method does NOT use SMTP, so Render cannot block it.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Sent from Care4Life Health Tracker Project</p>
        </div>
    `;

    try {
        const result = await sendGmailApiEmail(testRecipient, subject, htmlContent);
        
        if (result.success) {
            console.log("\n✅ Test Result: SUCCESS");
            console.log("Message ID:", result.messageId);
            console.log("\nPlease check your INBOX (and Spam/Promotions) at:", testRecipient);
        } else {
            console.log("\n❌ Test Result: FAILED");
            console.log("Error:", result.error);
            console.log("\nTip: Make sure you have enabled the 'Gmail API' in Google Cloud Console.");
        }
    } catch (error) {
        console.error("\n💥 Unexpected Error:", error.message);
    }
    
    process.exit(0);
};

testEmail();
