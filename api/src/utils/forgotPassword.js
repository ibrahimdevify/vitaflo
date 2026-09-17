const crypto = require('crypto');
const { sendPasswordResetEmail } = require('./emailService');

// Adjust this to wherever your mobile app / web app handles the reset link

const forgotPassword = async (req, res) => {
  try {
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
        select: { user_id: true, email: true, phone: true, f_name: true, l_name: true },
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
      const patient = await prisma.dc_patient_details.findFirst({
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

    // dc_users.findFirst above only selected default fields when matched by email;
    // when matched by phone we already selected f_name/email. Re-fetch minimal fields
    // to be safe regardless of which branch matched.
    const fullUser = await prisma.dc_users.findFirst({
      where: { user_id: user.user_id },
      select: { user_id: true, email: true, f_name: true },
    });

    if (!fullUser.email) {
      return res.status(400).json({
        error: 'No email on file',
        message: 'This account has no email address to send a reset link to.',
      });
    }

    // Create reset token
    const contactMethod = email ? 'email' : 'phone';
    const contact = email || phone;
    const token = crypto.randomBytes(32).toString('hex');

    await prisma.vf_reset_password_token.create({
      data: {
        user_id: fullUser.user_id,
        contact_method: contactMethod,
        contact,
        token, // make sure this column exists on vf_reset_password_token; add it if not
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
      },
    });

    const resetUrl = `${RESET_BASE_URL}?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: fullUser.email,
        firstName: fullUser.f_name,
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

module.exports = { forgotPassword };
