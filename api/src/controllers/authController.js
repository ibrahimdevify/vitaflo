const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { generateAccessToken } = require('../utils/token');
const jwt = require('jsonwebtoken');
const { generateUserName } = require('../utils/usernameGenerator');
const roleService = require('../services/roleService');
const { forgotPassword, confirmReset } = require('./auth/passwordReset');
// ⚠️ Adjust this path if passwordReset.js lives somewhere else — it needs
// to resolve to the file with the real forgotPassword/confirmReset logic
// (the one requiring '../../utils/password' and '../../utils/emailService').

const prisma = new PrismaClient();

// Login
const login = async (req, res) => {
  try {
    const { username, password,portal } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user by email or phone
    const user = await prisma.dc_users.findFirst({
      where: {
        OR: [
          { email: username },
          { userName: username },
        ],
      },
      include: {
        user_type: true,
        user_status: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (portal === 'admin') {
  // Admin portal: only user type 2
  if (user.ut_id_fk !== 2) {
    return res.status(403).json({
      error: 'Access denied. Admin users only.'
    });
  }
} else {
  // Clinician portal: only user types 3 and 6
  if (user.ut_id_fk !== 3 && user.ut_id_fk !== 6) {
    return res.status(403).json({
      error: 'Access denied. Clinician users only.'
    });
  }
}
    // Check password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.user_status.name !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate tokens
    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken();

    // Store session
    await prisma.vf_session.create({
      data: {
        access_token: accessToken,
        user_id: user.user_id,
        last_action: new Date(),
      },
    });

    // Get user type specific data
    let userData = {
      user_id: user.user_id,
      email: user.email,
      phone: user.phone,
      f_name: user.f_name,
      l_name: user.l_name,
      user_type: user.user_type.name,
      ut_id_fk: user.ut_id_fk,
      is_guardian: user.is_guardian,
    };

    // Get type-specific details
    if (user.ut_id_fk === 3 || user.ut_id_fk === 6) {
      // Clinician
      const doctor = await prisma.dc_doctor_details.findFirst({
        where: { user_id_fk: user.user_id },
      });
      userData.doctor_details = doctor;
    } else if (user.ut_id_fk === 4) {
      // Patient
      const patient = await prisma.dc_patient_details.findFirst({
        where: { user_id_fk: user.user_id },
      });
      userData.patient_details = patient;
    }

    // Module permissions for this user's role — lets the frontend decide which
    // nav items to show and which routes to guard, without a separate round trip.
    // Every module in dc_modules comes back (isView/isWriteable default to false
    // for modules with no dc_module_roles row yet), so the client never has to
    // guess whether "missing" means "denied" or "not loaded".
    const modules = (await roleService.getRolePermissions(user.ut_id_fk)) || [];

    res.json({
      message: 'Login successful',
      access_token: accessToken,
      jwt_token: jwtToken,
      refresh_token: refreshToken,
      user: userData,
      modules,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Register
const register = async (req, res) => {
  try {
    const {
      f_name,
      l_name,
      email,
      phone,
      password,
      ut_id_fk, // user type: 1=technician, 2=account_admin, 3=clinician, 4=patient
      dob,
      gender_id_fk,
      address,
      city_id_fk,
      is_guardian,
    } = req.body;

    // Check existing user
    const existingUser = await prisma.dc_users.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        field: existingUser.email === email ? 'email' : 'phone',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const userName = await generateUserName(email);

    // Create user
    const user = await prisma.dc_users.create({
      data: {
        f_name,
        l_name,
        email,
        phone,
        userName,
        password: hashedPassword,
        ut_id_fk: ut_id_fk || 4,
        us_id_fk: 1, // active
        is_guardian: is_guardian || false,
        is_availible: true,
        user_details: {
          create: {
            dob: new Date(dob),
            gender_id_fk: gender_id_fk || 1,
            martial_status_fk: 1,
            address: address || '',
            city_id_fk: city_id_fk || 1,
            signup_platform: 'api',
          },
        },
      },
      include: {
        user_type: true,
        user_details: true,
      },
    });

    // Generate tokens
    const jwtToken = generateToken(user);
    const accessToken = generateAccessToken();

    // Store session
    await prisma.vf_session.create({
      data: {
        access_token: accessToken,
        user_id: user.user_id,
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      access_token: accessToken,
      jwt_token: jwtToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        f_name: user.f_name,
        l_name: user.l_name,
        user_type: user.user_type.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Get current user (me)
const me = async (req, res) => {
  try {
    const user = await prisma.dc_users.findFirst({
      where: { user_id: req.user.user_id },
      include: {
        user_type: true,
        user_status: true,
        user_details: {
          include: {
            gender: true,
            city: true,
            martial: true,
          },
        },
        doctor_details: true,
        patient_details: {
          include: {
            patient_group: true,
            assigned_clinician: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Delete session
    if (req.session) {
      await prisma.vf_session.delete({
        where: { access_token: req.session.access_token },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Refresh token
const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const decoded = require('../utils/jwt').verifyToken(refresh_token);
    const user = await prisma.dc_users.findFirst({
      where: { user_id: decoded.user_id },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken();
    const newJwtToken = generateToken(user);

    // Create new session
    await prisma.vf_session.create({
      data: {
        access_token: newAccessToken,
        user_id: user.user_id,
      },
    });

    res.json({
      access_token: newAccessToken,
      jwt_token: newJwtToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.user_id;

    const user = await prisma.dc_users.findFirst({
      where: { user_id: userId },
    });

    const validPassword = await comparePassword(current_password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(new_password);
    await prisma.dc_users.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
};

module.exports = {
  login,
  register,
  me,
  logout,
  refresh,
  forgotPassword,             // delegated to controllers/auth/passwordReset.js
  resetPassword: confirmReset, // delegated — same route name, real implementation
  changePassword,
};