import {sendBravoEmail} from '../../utils/brevoEmailSender.js';
import { EMAIL_SUBJECTS } from '../../constants/Imasha/index.js';

/**
 * Sends email verification email
 */
export const sendVerificationEmail = async (email, firstName, token) => { 
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Healthcare System</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Thank you for registering with Healthcare System!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Healthcare System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
  try {
    await sendBravoEmail(email, EMAIL_SUBJECTS.VERIFY_EMAIL, htmlContent);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Sends password reset email
 */
export const sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Healthcare System</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>We received a request to reset your password.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2026 Healthcare System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
  try {
    await sendBravoEmail(email, EMAIL_SUBJECTS.PASSWORD_RESET, htmlContent);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Sends account locked notification email
 */
export const sendAccountLockedEmail = async (email, firstName) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Account Security Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <div class="warning">
                <p><strong>⚠️ Your account has been temporarily locked</strong></p>
                <p>We've detected multiple failed login attempts on your account. For your security, your account has been locked for 30 minutes.</p>
              </div>
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Wait 30 minutes and try logging in again</li>
                <li>If you forgot your password, use the "Forgot Password" option</li>
                <li>If you didn't attempt to login, change your password immediately</li>
              </ul>
              <p>If you need assistance, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Healthcare System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
  try {
    await sendBravoEmail(email, EMAIL_SUBJECTS.ACCOUNT_LOCKED, htmlContent);
    console.log(`Account locked email sent to ${email}`);
  } catch (error) {
    console.error('Error sending account locked email:', error);
  }
};

/**
 * Sends welcome email
 */
export const sendWelcomeEmail = async (email, firstName) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Healthcare System! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Your email has been verified successfully!</p>
              <p>You can now access all features of our healthcare platform.</p>
              <p><strong>Get started:</strong></p>
              <ul>
                <li>Complete your profile</li>
                <li>Book your first appointment</li>
                <li>Explore health tracking features</li>
              </ul>
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Healthcare System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
  try {
    await sendBravoEmail(email, EMAIL_SUBJECTS.WELCOME, htmlContent);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};
