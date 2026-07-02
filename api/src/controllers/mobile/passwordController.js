const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../utils/password');

const prisma = new PrismaClient();

// Normalize phone number for flexible matching
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

// Request Password Reset
const forgotPassword = async (req, res) => {
  try {
    const { userType, forgotUsername, forgotPassword, email, phone, dob } = req.body;

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
        if (userPhone.endsWith(normalizedInput.slice(-8)) || 
            normalizedInput.endsWith(userPhone.slice(-8))) {
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

    // Create reset token
    const contactMethod = email ? 'email' : 'phone';
    const contact = email || phone;

    await prisma.vf_reset_password_token.create({
      data: {
        user_id: user.user_id,
        contact_method: contactMethod,
        contact: contact,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
      },
    });

    res.json({
      success: true,
      message: 'Verification credentials sent successfully via SMS.',
      username: forgotUsername ? user.email : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// Confirm Password Reset
const confirmReset = async (req, res) => {
  try {
    const { token, password, username, userType } = req.body;

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
