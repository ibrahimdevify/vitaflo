/**
 * emailService.js
 * Reusable email sending module built on SendGrid.
 *
 * ENV VARS REQUIRED:
 *   SENDGRID_API_KEY - your SendGrid API key
 *   EMAIL_FROM       - verified sender, e.g. "no-reply@yourapp.com"
 *   EMAIL_FROM_NAME  - display name, e.g. "YourApp" (optional)
 *   APP_NAME         - display name used in templates (optional, default below)
 *   SUPPORT_EMAIL    - shown in footer for help (optional)
 *
 * npm install @sendgrid/mail
 */

const sgMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY) {
  console.warn('WARNING: SENDGRID_API_KEY is not set — email sending will fail.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const APP_NAME = process.env.APP_NAME || 'Our App';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM;

/**
 * Base neutral HTML wrapper — consistent header/footer for all emails.
 */
function wrapTemplate({ title, bodyHtml }) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2933;">
    <div style="padding: 24px 0; border-bottom: 1px solid #e4e7eb;">
      <span style="font-size: 18px; font-weight: 600; color: #111827;">${APP_NAME}</span>
    </div>
    <div style="padding: 32px 0;">
      <h2 style="font-size: 20px; margin: 0 0 16px; color: #111827;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding: 20px 0; border-top: 1px solid #e4e7eb; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 4px;">This is an automated message from ${APP_NAME}.</p>
      <p style="margin: 0;">Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb;">${SUPPORT_EMAIL}</a></p>
    </div>
  </div>`;
}

/**
 * Generic low-level sender. Use this directly, or the helpers below.
 */
async function sendEmail({ to, subject, html, cc, replyTo }) {
  if (!to) throw new Error('sendEmail: "to" is required');
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not set');
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is not set');

  const msg = {
    to,
    from: process.env.EMAIL_FROM_NAME
      ? { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME }
      : process.env.EMAIL_FROM,
    subject,
    html,
  };
  if (cc) msg.cc = cc;
  if (replyTo) msg.replyTo = replyTo;

  try {
    const [response] = await sgMail.send(msg);
    return response;
  } catch (err) {
    // SendGrid puts the useful detail in err.response.body
    const detail = err.response?.body ? JSON.stringify(err.response.body) : err.message;
    throw new Error(`SendGrid error: ${detail}`);
  }
}

/**
 * Forgot-password email — sends a reset link/token, not a raw password.
 */
async function sendPasswordResetEmail({ to, firstName, resetUrl, userName, email }) {
  const html = wrapTemplate({
    title: 'Reset your password',
    bodyHtml: `
      <p style="font-size: 14px; line-height: 1.6;">Hi ${firstName || 'there'},</p>
      
      ${userName ? `
      <p style="font-size: 14px; line-height: 1.6;">
        We received a request to reset the password for your account 
        <strong style="color: #2563eb;">@${userName}</strong>${email ? ` (${email})` : ''}.
      </p>
      ` : `
      <p style="font-size: 14px; line-height: 1.6;">
        We received a request to reset your ${APP_NAME} password.
      </p>
      `}
      
      <p style="font-size: 14px; line-height: 1.6;">
        Click the button below to choose a new one. This link will expire shortly for your security.
      </p>
      
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; display: inline-block;">
          Reset Password
        </a>
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #374151;">
          Account Information
        </p>
        ${userName ? `
        <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">
          <strong>Username:</strong> @${userName}
        </p>
        ` : ''}
        ${email ? `
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          <strong>Email:</strong> ${email}
        </p>
        ` : ''}
      </div>
      
      <p style="font-size: 13px; line-height: 1.6; color: #6b7280; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email — your password will stay unchanged.
      </p>
    `,
  });

  return sendEmail({ to, subject: `Reset your ${APP_NAME} password`, html });
}

/**
 * New auto-generated password email (bulk reset flow).
 */
async function sendNewPasswordEmail({ to, firstName, newPassword }) {
  const html = wrapTemplate({
    title: 'Your new password',
    bodyHtml: `
      <p style="font-size: 14px; line-height: 1.6;">Hi ${firstName || 'there'},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        Your ${APP_NAME} password has been reset. Here is your new, auto-generated password:
      </p>
      <p style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; font-size: 18px; font-weight: 600; letter-spacing: 1px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 18px; font-family: monospace;">
          ${newPassword}
        </span>
      </p>
      <p style="font-size: 14px; line-height: 1.6;">
        Please use this password to log in. Since it was generated automatically, we recommend
        changing it to something memorable right after you sign in.
      </p>
      <p style="font-size: 14px; line-height: 1.6;">
        If this password doesn't work, open the mobile app and tap
        <strong>Forgot Password</strong> to reset it yourself.
      </p>
    `,
  });

  return sendEmail({ to, subject: `Your new ${APP_NAME} password`, html });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendNewPasswordEmail,
};
