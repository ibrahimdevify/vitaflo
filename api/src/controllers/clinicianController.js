const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllClinicians = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, h_id_fk, is_specialist } = req.query;
    const where = { ut_id_fk: 3 };
    if (search) {
      where.OR = [
        { f_name: { contains: search } }, { l_name: { contains: search } },
        { email: { contains: search } }, { doctor_details: { license_no: { contains: search } } },
      ];
    }
    if (h_id_fk) where.doctor_details = { h_id_fk: parseInt(h_id_fk) };
    if (is_specialist) where.doctor_details = { ...where.doctor_details, is_specialist: is_specialist === 'true' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clinicians, total] = await Promise.all([
      prisma.dc_users.findMany({
        where, skip, take: parseInt(limit), orderBy: { reg_date: 'desc' },
        select: {
          user_id: true, f_name: true, l_name: true, email: true, phone: true,
          profile_pic: true, is_availible: true, reg_date: true,
          user_status: { select: { name: true } },
          doctor_details: { select: { dd_id: true, about_doctor: true, education: true, license_no: true, is_specialist: true, experience: true, hospital: { select: { id: true, name: true } } } },
          _count: { select: { assigned_patients: true } },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);
    res.json({ data: clinicians, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get clinicians error:', error);
    res.status(500).json({ error: 'Failed to fetch clinicians' });
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

module.exports = { getAllClinicians, getClinicianById, assignPatient, unassignPatient, getClinicianPatients, getClinicianOverview, updateDoctorDetails };
