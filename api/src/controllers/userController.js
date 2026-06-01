const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');

const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, ut_id_fk, us_id_fk, sort_by = 'reg_date', sort_dir = 'desc' } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { f_name: { contains: search } },
        { l_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (ut_id_fk) where.ut_id_fk = parseInt(ut_id_fk);
    if (us_id_fk) where.us_id_fk = parseInt(us_id_fk);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.dc_users.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort_by]: sort_dir },
        select: {
          user_id: true, f_name: true, l_name: true, email: true, phone: true,
          profile_pic: true, is_guardian: true, is_availible: true,
          is_profile_completed: true, is_rpm_allow: true,
          reg_date: true, profile_update_date: true,
          ut_id_fk: true, us_id_fk: true,
          user_type: { select: { ut_id: true, name: true } },
          user_status: { select: { us_id: true, name: true } },
          _count: { select: { fcm_tokens: true, sessions: true } },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    res.json({ data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.dc_users.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        user_type: true, user_status: true,
        user_details: { include: { gender: true, city: true, martial: true } },
        doctor_details: true,
        patient_details: {
          include: {
            patient_group: true,
            assigned_clinician: { select: { user_id: true, f_name: true, l_name: true, email: true } },
            attributes: { include: { addresses: true, air_monitors: { include: { device: true } } } },
          },
        },
        fcm_tokens: { where: { is_enabled: true }, orderBy: { date_time: 'desc' } },
        sessions: { orderBy: { created: 'desc' }, take: 5 },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...safeUser } = user;
    res.json({ data: safeUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { f_name, l_name, email, phone, password, ut_id_fk, us_id_fk = 1, is_guardian = false, is_rpm_allow = false } = req.body;
    if (!f_name || !l_name || !email || !phone || !password || !ut_id_fk) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await prisma.dc_users.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = await hashPassword(password);
    const user = await prisma.dc_users.create({
      data: { f_name, l_name, email, phone, password: hashed, ut_id_fk: parseInt(ut_id_fk), us_id_fk: parseInt(us_id_fk), is_guardian, is_rpm_allow },
      include: { user_type: true, user_status: true },
    });
    const { password: _, ...safeUser } = user;
    res.status(201).json({ message: 'User created', data: safeUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { f_name, l_name, email, phone, us_id_fk, is_guardian, is_availible, is_profile_completed, is_rpm_allow, password } = req.body;
    const data = {};
    if (f_name) data.f_name = f_name;
    if (l_name) data.l_name = l_name;
    if (email) data.email = email;
    if (phone) data.phone = phone;
    if (us_id_fk !== undefined) data.us_id_fk = parseInt(us_id_fk);
    if (is_guardian !== undefined) data.is_guardian = is_guardian;
    if (is_availible !== undefined) data.is_availible = is_availible;
    if (is_profile_completed !== undefined) data.is_profile_completed = is_profile_completed;
    if (is_rpm_allow !== undefined) data.is_rpm_allow = is_rpm_allow;
    if (password) data.password = await hashPassword(password);
    data.profile_update_date = new Date();

    const user = await prisma.dc_users.update({
      where: { user_id: parseInt(id) },
      data,
      include: { user_type: true, user_status: true },
    });
    const { password: _, ...safeUser } = user;
    res.json({ message: 'User updated', data: safeUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dc_users.update({ where: { user_id: parseInt(id) }, data: { us_id_fk: 2 } });
    res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

const getUserTypes = async (req, res) => {
  try {
    const types = await prisma.dc_user_type.findMany();
    res.json({ data: types });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user types' });
  }
};

const getUserStatuses = async (req, res) => {
  try {
    const statuses = await prisma.dc_user_status.findMany();
    res.json({ data: statuses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user statuses' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserTypes, getUserStatuses };
