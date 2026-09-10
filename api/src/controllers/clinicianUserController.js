const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');
const { generateUserName } = require('../utils/usernameGenerator');

const prisma = new PrismaClient();

const ALLOWED_SORT_FIELDS = new Set([
  "reg_date",
  "profile_update_date",
  "f_name",
  "l_name",
  "email",
]);

const getAllClinicians = async (req, res) => {
  try {
    // Only a clinician_admin may list their own clinicians.
    // (Belt-and-suspenders alongside the dc_module_roles / route-level check.)
    if (req.user?.ut_id_fk !== 6) {
      return res.status(403).json({ error: "Not authorized to view clinicians" });
    }

    const {
      page = 1,
      limit = 20,
      search,
      sort_by = "reg_date",
      sort_dir = "desc",
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const safeLimit =
      Number.isNaN(parsedLimit) || parsedLimit < 1
        ? 20
        : Math.min(parsedLimit, 100); // cap to avoid huge scans

    const sortField = ALLOWED_SORT_FIELDS.has(sort_by) ? sort_by : "reg_date";
    const sortDir = sort_dir === "asc" ? "asc" : "desc";

    const where = {
      us_id_fk: 1, // active
      ut_id_fk: 3, // clinician
      // Scope to clinicians created by/assigned to this clinician_admin
      clinician_admin_link: {
        clinician_admin_id: req.user.user_id,
      },
    };

    if (search) {
      const searchTerm = search.trim();
      const nameParts = searchTerm.split(/\s+/).filter(Boolean);

      where.OR = [
        { f_name: { contains: searchTerm } },
        { l_name: { contains: searchTerm } },
        { userName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
      ];

      // Handle "First Last" style full-name search across two fields
      if (nameParts.length > 1) {
        where.OR.push(
          {
            AND: [
              { f_name: { contains: nameParts[0] } },
              { l_name: { contains: nameParts.slice(1).join(" ") } },
            ],
          },
          {
            AND: [
              { f_name: { contains: nameParts[nameParts.length - 1] } },
              { l_name: { contains: nameParts.slice(0, -1).join(" ") } },
            ],
          }
        );
      }
    }

    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      prisma.dc_users.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { [sortField]: sortDir },
        select: {
          user_id: true,
          f_name: true,
          l_name: true,
          email: true,
          phone: true,
          userName: true,
          profile_pic: true,
          is_guardian: true,
          is_availible: true,
          is_profile_completed: true,
          is_rpm_allow: true,
          reg_date: true,
          profile_update_date: true,
          ut_id_fk: true,
          us_id_fk: true,
          user_type: { select: { ut_id: true, name: true } },
          user_status: { select: { us_id: true, name: true } },
          _count: { select: { fcm_tokens: true, sessions: true } },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get clinicians error:", error);
    res.status(500).json({ error: "Failed to fetch clinicians" });
  }
};



const createClinicianUser = async (req, res) => {
  try {
    // Only a clinician_admin can create clinician accounts
    if (req.user?.ut_id_fk !== 6) {
      return res.status(403).json({ error: "Not authorized to create clinicians" });
    }

    const {
      f_name,
      l_name,
      email,
      phone,
      password,
      us_id_fk = 1,
      is_guardian = false,
      is_rpm_allow = false,
    } = req.body;

    if (!f_name || !l_name || !email || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedUsId = parseInt(us_id_fk, 10);
    if (Number.isNaN(parsedUsId)) {
      return res.status(400).json({ error: "us_id_fk must be a valid integer" });
    }

    const existing = await prisma.dc_users.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await hashPassword(password);
    const userName = await generateUserName(email);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.dc_users.create({
        data: {
          f_name,
          l_name,
          userName,
          email,
          phone,
          password: hashed,
          ut_id_fk: 3, // clinician — never take this from the request body
          us_id_fk: parsedUsId,
          is_guardian,
          is_rpm_allow,
        },
        include: { user_type: true, user_status: true },
      });

      await tx.dc_clinician_assignments.create({
        data: {
          clinician_admin_id: req.user.user_id,
          clinician_id: user.user_id,
        },
      });

      return user;
    });

    const { password: _password, ...safeUser } = result;
    res.status(201).json({ message: "Clinician created", data: safeUser });
  } catch (error) {
    console.error("Create clinician error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Email, phone, or username already exists",
        field: error.meta?.target,
      });
    }

    res.status(500).json({ error: "Failed to create clinician" });
  }
};


const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
};

const updateClinicianUser = async (req, res) => {
  try {
    // Only a clinician_admin can update clinician accounts
    if (req.user?.ut_id_fk !== 6) {
      return res.status(403).json({ error: "Not authorized to update clinicians" });
    }

    const { id } = req.params;
    const clinicianId = parseInt(id, 10);
    if (Number.isNaN(clinicianId)) {
      return res.status(400).json({ error: "Invalid clinician ID" });
    }

    // Ownership check: this clinician must belong to the calling admin
    const assignment = await prisma.dc_clinician_assignments.findFirst({
      where: {
        clinician_id: clinicianId,
        clinician_admin_id: req.user.user_id,
      },
    });
    if (!assignment) {
      return res.status(404).json({ error: "Clinician not found" });
    }

    const {
      f_name,
      l_name,
      email,
      phone,
      us_id_fk,
      is_guardian,
      is_availible,
      is_profile_completed,
      is_rpm_allow,
      password,
    } = req.body;

    const data = {};
    if (f_name !== undefined) data.f_name = f_name;
    if (l_name !== undefined) data.l_name = l_name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;

    if (us_id_fk !== undefined) {
      const parsedUsId = parseInt(us_id_fk, 10);
      if (Number.isNaN(parsedUsId)) {
        return res.status(400).json({ error: "us_id_fk must be a valid integer" });
      }
      data.us_id_fk = parsedUsId;
    }

    if (is_guardian !== undefined) data.is_guardian = toBoolean(is_guardian);
    if (is_availible !== undefined) data.is_availible = toBoolean(is_availible);
    if (is_profile_completed !== undefined) data.is_profile_completed = toBoolean(is_profile_completed);
    if (is_rpm_allow !== undefined) data.is_rpm_allow = toBoolean(is_rpm_allow);

    if (password) data.password = await hashPassword(password);

    data.profile_update_date = new Date();

    const user = await prisma.dc_users.update({
      where: { user_id: clinicianId },
      data,
      include: { user_type: true, user_status: true },
    });

    const { password: _password, ...safeUser } = user;
    res.json({ message: "Clinician updated", data: safeUser });
  } catch (error) {
    console.error("Update clinician error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Clinician not found" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Email or phone already exists",
        field: error.meta?.target,
      });
    }

    res.status(500).json({ error: "Failed to update clinician" });
  }
};






module.exports = { getAllClinicians, createClinicianUser,updateClinicianUser };
