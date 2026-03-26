import { google } from 'googleapis';

/**
 * Sends an email using the Gmail REST API (Pure HTTP).
 * This method is the MOST RELIABLE for Render since it uses Port 443 (standard web port)
 * and bypasses all SMTP port blocks (25, 465, 587).
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Full HTML email body
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
export const sendGmailApiEmail = async (to, subject, htmlContent) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Create RFC822 formatted email message
  // We need to encode the subject for UTF-8 support
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const fromName = process.env.EMAIL_FROM_NAME || 'Care4Life Health';
  const fromEmail = process.env.EMAIL_FROM || 'miyurut20@gmail.com';

  const messageParts = [
    `From: "${fromName}" <${fromEmail}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    htmlContent,
  ];
  const message = messageParts.join('\r\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log(`[Gmail API] ✅ Email sent to ${to}. Message ID: ${res.data.id}`);
    return { success: true, messageId: res.data.id };
  } catch (error) {
    // Better error logging for debugging
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`[Gmail API] ❌ REST API Error:`, errorMsg);
    
    if (error.response?.data?.error?.errors) {
        console.error("[Gmail API] 🚩 Details:", JSON.stringify(error.response.data.error.errors));
    }
    
    return { success: false, error: errorMsg };
  }
};
