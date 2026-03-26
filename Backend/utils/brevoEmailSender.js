import axios from 'axios';

/**
 * Sends an email using the Brevo (formerly Sendinblue) HTTP API.
 * This bypasses Render's SMTP port blocks by using standard HTTP POST (Port 443).
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Full HTML email body
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export const sendBrevoEmail = async (to, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn("[Brevo] ⚠️ BREVO_API_KEY not found in .env. Skipping email sending.");
    return { success: false, error: "Missing API Key" };
  }

  const emailData = {
    sender: { 
        name: process.env.EMAIL_FROM_NAME || "Care4Life Health", 
        email: process.env.EMAIL_FROM || "noreply@healthcare.com" 
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent,
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000 // 15s timeout
    });
    
    console.log(`[Brevo] ✅ Email sent successfully to ${to}. Message ID: ${response.data.messageId}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`[Brevo] ❌ Delivery failure to ${to}:`, errorData);
    return { success: false, error: errorData };
  }
};
