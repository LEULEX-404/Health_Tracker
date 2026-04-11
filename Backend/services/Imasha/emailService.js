import { sendGmailApiEmail } from '../../utils/gmailEmailSender.js';
import { EMAIL_SUBJECTS } from '../../constants/Imasha/index.js';

const BRAND = {
  name: 'PulseNova',
  tagline: 'Every Pulse Matters',
  supportEmail: process.env.EMAIL_FROM || 'support@pulsanova.com',
  year: '2026',
};

const EMAIL_THEME = {
  primary: '#00c897',
  primaryDark: '#059669',
  accent: '#39ff14',
  ink: '#0f172a',
  muted: '#64748b',
  surface: '#ffffff',
  surfaceAlt: '#f8fffc',
  border: '#d7f5ea',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  warningBg: '#fef2f2',
  warningBorder: '#fecaca',
  warningText: '#b91c1c',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderLogoMarkup = () => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
    <tr>
      <td style="padding-right: 12px; vertical-align: middle;">
        <svg width="42" height="42" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="18" cy="18" r="17" stroke="#00c897" stroke-width="2"/>
          <path d="M4 18 L10 18 L13 11 L16 25 L19 14 L22 20 L25 18 L32 18" stroke="url(#pulseGradEmail)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <defs>
            <linearGradient id="pulseGradEmail" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00c897"/>
              <stop offset="0.5" stop-color="#39ff14"/>
              <stop offset="1" stop-color="#00e6ad"/>
            </linearGradient>
          </defs>
        </svg>
      </td>
      <td style="vertical-align: middle; text-align: left;">
        <div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: 800; line-height: 1; color: #ffffff; letter-spacing: -0.02em;">
          Pulse<span style="color: #39ff14;">Nova</span>
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255, 255, 255, 0.72); padding-top: 4px;">
          Every Pulse Matters
        </div>
      </td>
    </tr>
  </table>
`;

const renderBulletList = (items = []) => {
  if (!items.length) return '';

  const bullets = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 0 0 12px 0; vertical-align: top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 22px; padding-top: 2px; vertical-align: top;">
                  <div style="width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(135deg, ${EMAIL_THEME.primary}, ${EMAIL_THEME.accent});"></div>
                </td>
                <td style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.65; color: ${EMAIL_THEME.ink};">
                  ${item}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 8px;">
      ${bullets}
    </table>
  `;
};

const renderInfoCard = ({ title, description, tone = 'mint' }) => {
  const isWarning = tone === 'warning';
  const background = isWarning ? EMAIL_THEME.warningBg : EMAIL_THEME.successBg;
  const border = isWarning ? EMAIL_THEME.warningBorder : EMAIL_THEME.successBorder;
  const titleColor = isWarning ? EMAIL_THEME.warningText : EMAIL_THEME.primaryDark;

  return `
    <div style="margin: 24px 0 0; padding: 18px 20px; border-radius: 18px; background: ${background}; border: 1px solid ${border};">
      <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${titleColor}; margin-bottom: 8px;">
        ${title}
      </div>
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; color: ${EMAIL_THEME.ink};">
        ${description}
      </div>
    </div>
  `;
};

const renderEmailLayout = ({
  preheader,
  badge,
  title,
  intro,
  greeting,
  ctaLabel,
  ctaUrl,
  bodyHtml,
  infoCardHtml = '',
  closing = 'Need help? Reply to this email and the PulseNova team will take it from there.',
  footerNote = 'This message was sent by PulseNova because it relates to your account security or access.',
}) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #edf7f3;">
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
        ${escapeHtml(preheader)}
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(180deg, #edf7f3 0%, #f6fffb 100%);">
        <tr>
          <td align="center" style="padding: 36px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px;">
              <tr>
                <td style="padding-bottom: 20px; text-align: center;">
                  ${renderLogoMarkup()}
                </td>
              </tr>
              <tr>
                <td style="background: linear-gradient(135deg, #052e2b 0%, #0c4a44 60%, #0d5f56 100%); border-radius: 28px 28px 0 0; padding: 28px 32px 26px; text-align: left;">
                  <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.18); font-family: Arial, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #d1fae5;">
                    ${badge}
                  </div>
                  <h1 style="margin: 18px 0 10px; font-family: Arial, sans-serif; font-size: 34px; line-height: 1.15; letter-spacing: -0.03em; color: #ffffff;">
                    ${title}
                  </h1>
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.75; color: rgba(255, 255, 255, 0.82);">
                    ${intro}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background: ${EMAIL_THEME.surface}; border: 1px solid ${EMAIL_THEME.border}; border-top: 0; border-radius: 0 0 28px 28px; padding: 32px;">
                  <p style="margin: 0 0 18px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; color: ${EMAIL_THEME.ink};">
                    ${greeting}
                  </p>
                  <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.75; color: ${EMAIL_THEME.ink};">
                    ${bodyHtml}
                  </div>
                  <div style="padding: 28px 0 12px; text-align: center;">
                    <a href="${ctaUrl}" style="display: inline-block; padding: 15px 28px; border-radius: 14px; background: linear-gradient(135deg, ${EMAIL_THEME.primary}, ${EMAIL_THEME.primaryDark}); color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 0.01em;">
                      ${ctaLabel}
                    </a>
                  </div>
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.7; color: ${EMAIL_THEME.muted}; text-align: center; word-break: break-all;">
                    If the button does not open, copy this link into your browser:<br />
                    <a href="${ctaUrl}" style="color: ${EMAIL_THEME.primaryDark}; text-decoration: none;">${ctaUrl}</a>
                  </p>
                  ${infoCardHtml}
                  <div style="margin-top: 28px; padding-top: 22px; border-top: 1px solid ${EMAIL_THEME.border};">
                    <p style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.75; color: ${EMAIL_THEME.ink};">
                      ${closing}
                    </p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; color: ${EMAIL_THEME.muted};">
                      With care,<br />
                      <strong style="color: ${EMAIL_THEME.ink};">${BRAND.name} Care Team</strong>
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 18px 12px 0; text-align: center;">
                  <p style="margin: 0 0 6px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.7; color: ${EMAIL_THEME.muted};">
                    ${footerNote}
                  </p>
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.7; color: ${EMAIL_THEME.muted};">
                    &copy; ${BRAND.year} ${BRAND.name}. ${BRAND.tagline}. Contact: <a href="mailto:${BRAND.supportEmail}" style="color: ${EMAIL_THEME.primaryDark}; text-decoration: none;">${BRAND.supportEmail}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

/**
 * Sends email verification email
 */
export const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const htmlContent = renderEmailLayout({
    preheader: 'Confirm your email to activate your PulseNova account.',
    badge: 'Account verification',
    title: 'Confirm your email address',
    intro: 'One quick confirmation unlocks your account so you can start using PulseNova securely.',
    greeting: `Hi ${escapeHtml(firstName)},`,
    ctaLabel: 'Verify Email',
    ctaUrl: verificationUrl,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        Thanks for joining <strong>PulseNova</strong>. Before you sign in, please verify that this email belongs to you.
      </p>
      <p style="margin: 0 0 4px;">
        Once confirmed, you will be ready to:
      </p>
      ${renderBulletList([
        'access your health dashboard with confidence',
        'complete your profile and preferences',
        'start tracking progress, appointments, and care activity',
      ])}
    `,
    infoCardHtml: renderInfoCard({
      title: 'Verification link expiry',
      description: 'This verification link stays active for 24 hours. If you did not create a PulseNova account, you can safely ignore this email.',
    }),
    closing: 'Security matters here. We verify every account before allowing access so your health data starts protected from day one.',
    footerNote: 'You received this verification email because a new PulseNova account was created using this address.',
  });

  try {
    await sendGmailApiEmail(email, EMAIL_SUBJECTS.VERIFY_EMAIL, htmlContent);
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

  const htmlContent = renderEmailLayout({
    preheader: 'Use this secure link to reset your PulseNova password.',
    badge: 'Password security',
    title: 'Reset your password',
    intro: 'A password reset was requested for your PulseNova account. Use the secure button below to choose a new password.',
    greeting: `Hi ${escapeHtml(firstName)},`,
    ctaLabel: 'Reset Password',
    ctaUrl: resetUrl,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        We received a request to reset the password for your <strong>PulseNova</strong> account.
      </p>
      <p style="margin: 0 0 4px;">
        For the best security, your next password should be:
      </p>
      ${renderBulletList([
        'unique to PulseNova and not reused anywhere else',
        'at least 8 characters long with uppercase, lowercase, number, and symbol',
        'stored in a trusted password manager if possible',
      ])}
    `,
    infoCardHtml: renderInfoCard({
      title: 'Important security note',
      description: 'This reset link expires in 1 hour. If you did not request a password reset, you can ignore this email and your current password will remain unchanged.',
      tone: 'warning',
    }),
    closing: 'If this request was unexpected, review your account activity after signing in and update your password immediately.',
    footerNote: 'You received this email because someone requested a password reset for your PulseNova account.',
  });

  try {
    await sendGmailApiEmail(email, EMAIL_SUBJECTS.PASSWORD_RESET, htmlContent);
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
  const recoveryUrl = `${process.env.CLIENT_URL}/forgot-password`;

  const htmlContent = renderEmailLayout({
    preheader: 'Your PulseNova account was temporarily locked for security reasons.',
    badge: 'Security alert',
    title: 'Your account was temporarily locked',
    intro: 'We paused sign-in on your account after repeated failed login attempts to help keep your data protected.',
    greeting: `Hi ${escapeHtml(firstName)},`,
    ctaLabel: 'Reset Password',
    ctaUrl: recoveryUrl,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        Your account is locked for <strong>30 minutes</strong> from the latest failed attempt.
      </p>
      <p style="margin: 0 0 4px;">
        Here is what you can do next:
      </p>
      ${renderBulletList([
        'wait for the lock period to expire, then try signing in again',
        'use the password reset flow now if you may have forgotten your password',
        'change your password immediately if these attempts were not made by you',
      ])}
    `,
    infoCardHtml: renderInfoCard({
      title: 'Why this happened',
      description: 'PulseNova automatically rate-limits and locks accounts after several failed sign-in attempts. This reduces the chance of unauthorized access.',
      tone: 'warning',
    }),
    closing: 'If you were not the person trying to sign in, treat this as a genuine security event and reset your password before your next login.',
    footerNote: 'This security alert was sent automatically by PulseNova to protect your account.',
  });

  try {
    await sendGmailApiEmail(email, EMAIL_SUBJECTS.ACCOUNT_LOCKED, htmlContent);
    console.log(`Account locked email sent to ${email}`);
  } catch (error) {
    console.error('Error sending account locked email:', error);
  }
};

/**
 * Sends welcome email
 */
export const sendWelcomeEmail = async (email, firstName) => {
  const dashboardUrl = process.env.PATIENT_HOME_URL || process.env.CLIENT_URL;

  const htmlContent = renderEmailLayout({
    preheader: 'Your PulseNova account is verified and ready to use.',
    badge: 'Welcome to PulseNova',
    title: `You are in, ${escapeHtml(firstName)}`,
    intro: 'Your email has been verified successfully. Your PulseNova space is now ready for you.',
    greeting: `Welcome ${escapeHtml(firstName)},`,
    ctaLabel: 'Open PulseNova',
    ctaUrl: dashboardUrl,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        Your account is active and verified. You can now explore the full PulseNova experience with a secure, personalized setup.
      </p>
      <p style="margin: 0 0 4px;">
        Good first steps:
      </p>
      ${renderBulletList([
        'complete your profile so your care experience is better tailored',
        'review your dashboard and connected features',
        'start tracking appointments, health activity, and progress',
      ])}
    `,
    infoCardHtml: renderInfoCard({
      title: 'You are ready to go',
      description: 'Verification is complete, so future sign-ins will work normally with your email and password.',
    }),
    closing: 'We built PulseNova to feel calm, fast, and reliable when your health information matters. Glad to have you here.',
    footerNote: 'This welcome email confirms that your PulseNova email verification has been completed successfully.',
  });

  try {
    await sendGmailApiEmail(email, EMAIL_SUBJECTS.WELCOME, htmlContent);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};