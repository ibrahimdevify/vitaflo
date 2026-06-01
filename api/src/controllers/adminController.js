const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');
const prisma = new PrismaClient();

// Admin reset clinician password
const adminResetClinicianPassword = async (req, res) => {
  try {
    const { clinician_id, new_password } = req.body;
    
    const hashed = await hashPassword(new_password);
    await prisma.dc_users.update({
      where: { user_id: parseInt(clinician_id), ut_id_fk: 3 },
      data: { password: hashed },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get attributes list by names
const getAttributesList = async (req, res) => {
  try {
    const { name } = req.query;
    const names = name ? name.split(',') : [];
    
    const attributes = await prisma.vf_attributes.findMany({
      where: names.length > 0 ? {
        OR: names.map(n => ({ first_name: { contains: n } })),
      } : {},
      select: { id: true, first_name: true, last_name: true, dob: true, gender: true, chart_number: true },
      take: 100,
    });

    res.json({ data: attributes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

// Version
const getVersion = async (req, res) => {
  res.json({ version: '3.0.0', name: 'Ande API', framework: 'Express.js + Prisma', database: 'MySQL' });
};

module.exports = { adminResetClinicianPassword, getAttributesList, getVersion };
