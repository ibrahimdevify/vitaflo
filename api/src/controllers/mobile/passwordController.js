const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../utils/password');
const { sendPasswordResetEmail } = require('../../utils/emailService');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
// Normalize phone number for flexible matching
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

// Request Password Reset

// Separate secret from your auth JWT_SECRET so reset tokens can't be reused
// as login tokens or vice versa. Add this to your .env.
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET;
const RESET_BASE_URL = process.env.RESET_PASSWORD_URL;

const RESET_TOKEN_TTL = '30m';

const forgotPassword = async (req, res) => {
  try {
    if (!RESET_TOKEN_SECRET) {
      throw new Error('RESET_TOKEN_SECRET is not set');
    }

    const { userType, forgotUsername, email, phone, dob } = req.body;

    const utIdFk = userType === 'clinician' ? 3 : 4;

    let user = null;

    // Try exact email first
    if (email) {
      user = await prisma.dc_users.findFirst({
        where: { email, ut_id_fk: utIdFk },
      });
    }

    // Try phone with flexible matching
    if (!user && phone) {
      const normalizedInput = normalizePhone(phone);

      const users = await prisma.dc_users.findMany({
        where: { ut_id_fk: utIdFk },
        select: { user_id: true, email: true, phone: true, f_name: true, l_name: true, userName: true },
      });

      for (const u of users) {
        const userPhone = normalizePhone(u.phone || '');
        if (!userPhone || !normalizedInput) continue;
        // Match last 8 digits (handles 0317... vs +92317...)
        if (
          userPhone.endsWith(normalizedInput.slice(-8)) ||
          normalizedInput.endsWith(userPhone.slice(-8))
        ) {
          user = u;
          break;
        }
      }
    }

    // Verify DOB if provided
    if (user && dob) {
      const patient = await prisma.dc_patient_details.findUnique({
        where: { user_id_fk: user.user_id },
        include: { attributes: true },
      });
      const userDob = patient?.attributes?.dob;
      if (userDob && userDob !== dob) {
        return res.status(404).json({ error: 'User not found', message: 'Date of birth does not match' });
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'No account found with these details' });
    }

    const fullUser = await prisma.dc_users.findUnique({
      where: { user_id: user.user_id },
      select: { user_id: true, email: true, f_name: true, userName: true },
    });

    if (!fullUser.email) {
      return res.status(400).json({
        error: 'No email on file',
        message: 'This account has no email address to send a reset link to.',
      });
    }

    // Sign a short-lived, self-contained reset token — nothing to store or
    // look up later, its own signature + exp claim make it valid/invalid.
    const contactMethod = email ? 'email' : 'phone';
    const contact = email || phone;

    const token = jwt.sign(
      { user_id: fullUser.user_id, purpose: 'password_reset' },
      RESET_TOKEN_SECRET,
      { expiresIn: RESET_TOKEN_TTL }
    );

    // Audit trail only — uses columns that already exist on your table.
    // We don't store the token itself; resetPassword.js finds this row by
    // (user_id, used: false, most recent) when the reset completes.
    await prisma.vf_reset_password_token.create({
      data: {
        user_id: fullUser.user_id,
        contact_method: contactMethod,
        contact,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
      },
    });

    const resetUrl = `${RESET_BASE_URL}?token=${token}`;

    console.log(`Password reset URL for user ${fullUser.user_id}: ${resetUrl}`);

    try {
      await sendPasswordResetEmail({
        to: fullUser.email,
        firstName: fullUser.f_name,
        username: fullUser.userName,
        email: fullUser.email,
        resetUrl,
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
      return res.status(502).json({
        error: 'Email send failed',
        message: 'We found your account but could not send the reset email. Please try again shortly.',
      });
    }

    res.json({
      success: true,
      message: 'Verification credentials sent successfully to your email.',
      username: forgotUsername ? fullUser.email : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// Confirm Password Reset


const confirmReset = async (req, res) => {
  try {
    if (!RESET_TOKEN_SECRET) {
      throw new Error('RESET_TOKEN_SECRET is not set');
    }

    const { token, password, username } = req.body;

    if (!token || !password || !username) {
      return res.status(400).json({ error: 'Token, username, and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Verify the token FIRST — this is the actual proof of identity here,
    // not the username lookup. Without this check, anyone who knows a
    // user's email/phone could reset their password with any string as
    // "token".
    let payload;
    try {
      payload = jwt.verify(token, RESET_TOKEN_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (payload.purpose !== 'password_reset' || !payload.user_id) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = await prisma.dc_users.findFirst({
      where: { OR: [{ email: username }, { phone: username }] },
      include: {
        reset_tokens: {
          where: { used: false },
          orderBy: { created: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Confirm the token actually belongs to THIS user, not just any valid
    // token for any account.
    if (payload.user_id !== user.user_id) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.dc_users.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    if (user.reset_tokens.length > 0) {
      await prisma.vf_reset_password_token.update({
        where: { id: user.reset_tokens[0].id },
        data: { used: true },
      });
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Confirm reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};


module.exports = { forgotPassword, confirmReset };
