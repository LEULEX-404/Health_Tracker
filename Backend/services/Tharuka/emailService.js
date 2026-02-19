
import nodemailer from 'nodemailer';
/**
 * Creates nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  }); ""
};


/**
 * Sends meal reminder email
 */
export const sendMealReminderEmail = async (email, firstName, mealData) => {
  const transporter = createTransporter();
  
  const { mealName, mealType, scheduledTime, items = [] } = mealData;
  const formattedTime = scheduledTime ? new Date(scheduledTime).toLocaleString() : "scheduled time";
  
  const itemsList = items.length > 0
    ? items.map((item) => `<li>${item.quantity || ""} ${item.unit || "g"} ${item.name || ""}</li>`).join("")
    : "<li>Check your meal plan for details</li>";

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🍽️ Meal Reminder: ${mealName || mealType}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .meal-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Meal Reminder</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>This is a reminder for your scheduled meal:</p>
              <div class="meal-info">
                <h3>${mealName || mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                <p><strong>Type:</strong> ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</p>
                <p><strong>Scheduled Time:</strong> ${formattedTime}</p>
                ${items.length > 0 ? `<p><strong>Items:</strong></p><ul>${itemsList}</ul>` : ""}
              </div>
              <p>Don't forget to log your meal after you've eaten!</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Healthcare System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Meal reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending meal reminder email:', error);
    throw new Error('Failed to send meal reminder email');
  }
};
