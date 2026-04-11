import { sendGmailApiEmail } from '../../utils/gmailEmailSender.js';

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
  deepGreen: '#052e2b',
  headerInk: '#0b1f19',
  ink: '#0f172a',
  muted: '#64748b',
  surface: '#ffffff',
  border: '#d7f5ea',
  softBg: '#f3fffa',
  infoBg: '#ecfdf5',
  infoBorder: '#a7f3d0',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderLogoMarkup = () => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding-right: 10px; vertical-align: middle;">
        <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="18" cy="18" r="17" stroke="#00c897" stroke-width="2"/>
          <path d="M4 18 L10 18 L13 11 L16 25 L19 14 L22 20 L25 18 L32 18" stroke="url(#pulseGradMeal)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <defs>
            <linearGradient id="pulseGradMeal" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00c897"/>
              <stop offset="0.5" stop-color="#39ff14"/>
              <stop offset="1" stop-color="#00e6ad"/>
            </linearGradient>
          </defs>
        </svg>
      </td>
      <td style="vertical-align: middle; text-align: left;">
        <div style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 800; line-height: 1; color: ${EMAIL_THEME.headerInk}; letter-spacing: -0.02em;">
          Pulse<span style="color: ${EMAIL_THEME.primary};">Nova</span>
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #5f7f72; padding-top: 4px;">
          Every Pulse Matters
        </div>
      </td>
    </tr>
  </table>
`;

const renderBulletList = (items = []) => {
  if (!items.length) return '';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 8px;">
      ${items
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
        .join('')}
    </table>
  `;
};

const renderInfoCard = ({ title, content }) => `
  <div style="margin: 24px 0 0; padding: 18px 20px; border-radius: 18px; background: ${EMAIL_THEME.infoBg}; border: 1px solid ${EMAIL_THEME.infoBorder};">
    <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${EMAIL_THEME.primaryDark}; margin-bottom: 8px;">
      ${title}
    </div>
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; color: ${EMAIL_THEME.ink};">
      ${content}
    </div>
  </div>
`;

const renderEmailLayout = ({
  preheader,
  badge,
  title,
  intro,
  greeting,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  infoCardHtml = '',
  closing,
  footerNote,
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
                <td style="background: ${EMAIL_THEME.surface}; border: 1px solid ${EMAIL_THEME.border}; border-radius: 28px 28px 0 0; padding: 18px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="vertical-align: middle;">
                        ${renderLogoMarkup()}
                      </td>
                      <td style="text-align: right; vertical-align: middle;">
                        <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(0, 200, 151, 0.08); border: 1px solid rgba(0, 200, 151, 0.18); font-family: Arial, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: ${EMAIL_THEME.primaryDark};">
                          ${badge}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background: linear-gradient(135deg, ${EMAIL_THEME.deepGreen} 0%, #0a201a 55%, #0f3d34 100%); border-left: 1px solid ${EMAIL_THEME.border}; border-right: 1px solid ${EMAIL_THEME.border}; padding: 30px 32px 28px; text-align: left;">
                  <h1 style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 34px; line-height: 1.15; letter-spacing: -0.03em; color: #ffffff;">
                    ${title}
                  </h1>
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.8; color: #d8f7eb;">
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
                      <strong style="color: ${EMAIL_THEME.ink};">${BRAND.name} Nutrition Team</strong>
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
 * Sends meal reminder email
 */
export const sendMealReminderEmail = async (email, firstName, mealData) => {
  const { mealName, mealType, scheduledTime, items = [] } = mealData;
  const mealLabel = escapeHtml(mealName || (mealType ? `${mealType.charAt(0).toUpperCase()}${mealType.slice(1)}` : 'Upcoming Meal'));
  const mealTypeLabel = escapeHtml(mealType ? `${mealType.charAt(0).toUpperCase()}${mealType.slice(1)}` : 'Meal');
  const formattedTime = scheduledTime
    ? new Date(scheduledTime).toLocaleString()
    : 'Check your meal plan for the scheduled time';
  const appUrl = `${process.env.CLIENT_URL || 'https://healthhracker.vercel.app'}/nutrition`;

  const mealItems = items.length
    ? items.map((item) => {
        const quantity = item.quantity ? `${escapeHtml(item.quantity)} ` : '';
        const unit = item.unit ? `${escapeHtml(item.unit)} ` : '';
        const name = item.name ? escapeHtml(item.name) : 'Meal item';
        return `${quantity}${unit}${name}`.trim();
      })
    : ['Open your meal plan to review the scheduled meal details'];

  const subject = `Meal Reminder - ${mealName || mealTypeLabel}`;
  const htmlContent = renderEmailLayout({
    preheader: `Your ${mealName || mealTypeLabel} reminder from PulseNova is ready.`,
    badge: 'Meal reminder',
    title: `${mealLabel} is coming up`,
    intro: 'A quick reminder from PulseNova to help you stay aligned with your nutrition plan and daily routine.',
    greeting: `Hi ${escapeHtml(firstName)},`,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        This is your scheduled reminder for <strong>${mealLabel}</strong>.
      </p>
      ${renderInfoCard({
        title: 'Meal schedule',
        content: `
          <strong>Meal type:</strong> ${mealTypeLabel}<br />
          <strong>Scheduled time:</strong> ${escapeHtml(formattedTime)}
        `,
      })}
      <p style="margin: 24px 0 4px;">
        Your planned items:
      </p>
      ${renderBulletList(mealItems)}
    `,
    ctaLabel: 'Open Nutrition',
    ctaUrl: appUrl,
    infoCardHtml: renderInfoCard({
      title: 'After your meal',
      content: 'Remember to log what you ate in PulseNova so your tracking, progress, and future recommendations stay accurate.',
    }),
    closing: 'Small, consistent actions matter. Staying on time with your meals helps PulseNova give you better insights over time.',
    footerNote: 'You received this reminder because meal reminders are enabled for your PulseNova nutrition plan.',
  });

  try {
    const result = await sendGmailApiEmail(email, subject, htmlContent);
    if (!result.success) throw new Error(result.error);
    console.log(`Meal reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending meal reminder email:', error);
    throw new Error('Failed to send meal reminder email');
  }
};
