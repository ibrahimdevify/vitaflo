const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllClinicians = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, h_id_fk, is_specialist } = req.query;
    const where = { ut_id_fk: 3 };
    if (search) {
      const searchTerm = search.trim();
      const nameParts = searchTerm.split(/\s+/).filter(Boolean);

      where.OR = [
        { f_name: { contains: searchTerm } },
        { l_name: { contains: searchTerm } },
        { userName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
        { patient_details: { chart_no: { contains: searchTerm } } },
      ];

      // Handle "First Last" style full-name search across two fields
      if (nameParts.length > 1) {
        where.OR.push(
          {
            AND: [
              { f_name: { contains: nameParts[0] } },
              { l_name: { contains: nameParts.slice(1).join(' ') } },
            ],
          },
          {
            AND: [
              { f_name: { contains: nameParts[nameParts.length - 1] } },
              { l_name: { contains: nameParts.slice(0, -1).join(' ') } },
            ],
          },
        );
      }
    }
    if (h_id_fk) where.doctor_details = { h_id_fk: parseInt(h_id_fk) };
    if (is_specialist) where.doctor_details = { ...where.doctor_details, is_specialist: is_specialist === 'true' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clinicians, total] = await Promise.all([
      prisma.dc_users.findMany({
        where, skip, take: parseInt(limit), orderBy: { reg_date: 'desc' },
        select: {
          user_id: true, f_name: true, l_name: true, email: true, phone: true, userName: true,
          profile_pic: true, is_availible: true, reg_date: true,
          user_status: { select: { name: true } },
          doctor_details: { select: { dd_id: true, about_doctor: true, education: true, license_no: true, is_specialist: true, experience: true, hospital: { select: { id: true, name: true } } } },
          _count: { select: { assigned_patients: true } },
          clinician_admin_link: {
            select: {
              clinician_admin: {
                select: { user_id: true, f_name: true, l_name: true, email: true, phone: true, userName: true, profile_pic: true },
              },
            },
          },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    const data = clinicians.map(({ clinician_admin_link, ...rest }) => ({
      ...rest,
      clinician_admin: clinician_admin_link?.clinician_admin ?? null,
    }));

    res.json({ data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get clinicians error:', error);
    res.status(500).json({ error: 'Failed to fetch clinicians' });
  }
};
const getAllClinicianAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = { ut_id_fk: 6 }; // TODO: confirm actual ut_id for "clinician admin"
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
              { l_name: { contains: nameParts.slice(1).join(' ') } },
            ],
          },
          {
            AND: [
              { f_name: { contains: nameParts[nameParts.length - 1] } },
              { l_name: { contains: nameParts.slice(0, -1).join(' ') } },
            ],
          },
        );
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clinicianAdmins, total] = await Promise.all([
      prisma.dc_users.findMany({
        where, skip, take: parseInt(limit), orderBy: { reg_date: 'desc' },
        select: {
          user_id: true, f_name: true, l_name: true, email: true, phone: true, userName: true,
          profile_pic: true, is_availible: true, reg_date: true,
          user_status: { select: { name: true } },
          _count: { select: { managed_clinicians: true } },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    res.json({ data: clinicianAdmins, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get clinician admins error:', error);
    res.status(500).json({ error: 'Failed to fetch clinician admins' });
  }
};
const assignClinicianToAdmin = async (req, res) => {
  try {
    const { clinician_id, clinician_admin_id } = req.body;
    if (!clinician_id || !clinician_admin_id) {
      return res.status(400).json({ error: 'clinician_id and clinician_admin_id are required' });
    }

    const [clinician, admin] = await Promise.all([
      prisma.dc_users.findUnique({ where: { user_id: parseInt(clinician_id) } }),
      prisma.dc_users.findUnique({ where: { user_id: parseInt(clinician_admin_id) } }),
    ]);

    if (!clinician || clinician.ut_id_fk !== 3) {
      return res.status(404).json({ error: 'Clinician not found' });
    }
    if (!admin || admin.ut_id_fk !== 6) { // TODO: confirm ut_id for clinician admin
      return res.status(404).json({ error: 'Clinician admin not found' });
    }

    const assignment = await prisma.dc_clinician_assignments.upsert({
      where: { clinician_id: parseInt(clinician_id) },
      update: { clinician_admin_id: parseInt(clinician_admin_id) },
      create: {
        clinician_id: parseInt(clinician_id),
        clinician_admin_id: parseInt(clinician_admin_id),
      },
      select: {
        ca_id: true,
        clinician_admin: { select: { user_id: true, f_name: true, l_name: true, email: true } },
      },
    });

    res.json({ data: assignment });
  } catch (error) {
    console.error('Assign clinician error:', error);
    res.status(500).json({ error: 'Failed to assign clinician to admin' });
  }
};



const getClinicianById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinician = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(id), ut_id_fk: 3 },
      select: {
        user_id: true, f_name: true, l_name: true, email: true, phone: true,
        profile_pic: true, is_availible: true, is_profile_completed: true, reg_date: true,
        user_status: { select: { name: true } },
        user_details: { include: { gender: true, city: true, martial: true } },
        doctor_details: { include: { hospital: true } },
        assigned_patients: {
          select: {
            pd_id: true, chart_no: true, status: true,
            user: { select: { user_id: true, f_name: true, l_name: true, email: true, phone: true } },
          },
        },
      },
    });
    if (!clinician) return res.status(404).json({ error: 'Clinician not found' });

    const patientStats = await prisma.dc_patient_details.groupBy({
      by: ['status'], where: { assigned_clinician_id: parseInt(id) }, _count: true,
    });

    res.json({
      data: clinician,
      stats: { total_patients: clinician.assigned_patients.length, by_status: patientStats.reduce((acc, s) => { acc[s.status] = s._count; return acc; }, {}) },
    });
  } catch (error) {
    console.error('Get clinician error:', error);
    res.status(500).json({ error: 'Failed to fetch clinician' });
  }
};

const assignPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id } = req.body;
    const updated = await prisma.dc_patient_details.update({
      where: { user_id_fk: parseInt(patient_id) },
      data: { assigned_clinician_id: parseInt(id) },
    });
    res.json({ message: 'Patient assigned', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign patient' });
  }
};

const unassignPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    await prisma.dc_patient_details.update({ where: { user_id_fk: parseInt(patientId) }, data: { assigned_clinician_id: null } });
    res.json({ message: 'Patient unassigned' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unassign' });
  }
};

const getClinicianPatients = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const where = { ut_id_fk: 4, patient_details: { assigned_clinician_id: parseInt(id) } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [patients, total] = await Promise.all([
      prisma.dc_users.findMany({
        where, skip, take: parseInt(limit),
        select: { user_id: true, f_name: true, l_name: true, email: true, phone: true, reg_date: true, patient_details: { select: { pd_id: true, chart_no: true, status: true } } },
      }),
      prisma.dc_users.count({ where }),
    ]);
    res.json({ data: patients, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

const getClinicianOverview = async (req, res) => {
  try {
    const clinicianId = req.params.id || req.user.user_id;
    const [total, active, unverified] = await Promise.all([
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: parseInt(clinicianId) } }),
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: parseInt(clinicianId), status: 'active' } }),
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: parseInt(clinicianId), status: 'unverified' } }),
    ]);
    res.json({ data: { total_patients: total, active_patients: active, unverified_patients: unverified } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

const updateDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.dc_doctor_details.update({ where: { user_id_fk: parseInt(id) }, data: req.body });
    res.json({ message: 'Updated', data: doctor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
};

// Create clinician
const createClinician = async (req, res) => {
  try {
    const {
      f_name, l_name, email, phone, password,
      license_no, experience, about_doctor, education, is_specialist,
      h_id_fk,
    } = req.body;

    if (!f_name || !l_name || !email || !phone || !license_no) {
      return res.status(400).json({ error: "First name, last name, email, phone, and license number are required" });
    }

    const existingEmail = await prisma.dc_users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists", field: "email" });
    }

    const existingPhone = await prisma.dc_users.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: "Phone already exists", field: "phone" });
    }

    const { hashPassword } = require("../utils/password");
    const { generateUserName } = require("../utils/usernameGenerator");
    const hashedPassword = await hashPassword(password || "Doctor@123456");
    const userName = await generateUserName(email);

    const clinician = await prisma.dc_users.create({
      data: {
        f_name,
        l_name,
        email,
        phone,
        password: hashedPassword,
        userName,
        ut_id_fk: 3,
        us_id_fk: 1,
        is_availible: true,
        doctor_details: {
          create: {
            about_doctor: about_doctor || "",
            license_no,
            education: education || "",
            is_specialist: is_specialist || false,
            experience: experience || "2 yrs",
            h_id_fk: h_id_fk ? parseInt(h_id_fk) : 1,
            ps_id_fk: 1,
          },
        },
      },
      include: {
        doctor_details: true,
      },
    });

    res.status(201).json({ message: "Clinician created", data: clinician });
  } catch (error) {
    console.error("Create clinician error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already exists", message: error.message });
    }
    res.status(500).json({ error: "Failed to create clinician", message: error.message });
  }
};

// Update clinician
const updateClinician = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      f_name, l_name, email, phone, password,
      license_no, experience, about_doctor, education, is_specialist,
    } = req.body;

    const userData = {};
    if (f_name) userData.f_name = f_name;
    if (l_name) userData.l_name = l_name;
    if (email) userData.email = email;
    if (phone) userData.phone = phone;
    if (password) {
      const { hashPassword } = require("../utils/password");
      userData.password = await hashPassword(password);
    }

    const clinician = await prisma.dc_users.update({
      where: { user_id: parseInt(id) },
      data: userData,
      include: { doctor_details: true },
    });

    if (clinician.doctor_details) {
      const doctorData = {};
      if (license_no) doctorData.license_no = license_no;
      if (experience) doctorData.experience = experience;
      if (about_doctor) doctorData.about_doctor = about_doctor;
      if (education) doctorData.education = education;
      if (is_specialist !== undefined) doctorData.is_specialist = is_specialist;

      await prisma.dc_doctor_details.update({
        where: { user_id_fk: parseInt(id) },
        data: doctorData,
      });
    }

    res.json({ message: "Clinician updated", data: clinician });
  } catch (error) {
    console.error("Update clinician error:", error);
    res.status(500).json({ error: "Failed to update clinician", message: error.message });
  }
};

module.exports = { createClinician, updateClinician, getAllClinicians, getClinicianById, assignPatient, unassignPatient, getClinicianPatients, getClinicianOverview, updateDoctorDetails,getAllClinicianAdmins,assignClinicianToAdmin };
