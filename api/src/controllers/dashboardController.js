const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers, totalPatients, totalClinicians, totalPrescriptions,
      activePatients, unverifiedPatients, usersByType, patientsByStatus,
      recentRegistrations, prescriptionsThisMonth,
    ] = await Promise.all([
      prisma.dc_users.count(),
      prisma.dc_users.count({ where: { ut_id_fk: 4 } }),
      prisma.dc_users.count({ where: { ut_id_fk: 3 } }),
      prisma.dc_ehr_prescriptions.count({ where: { is_deleted: false } }),
      prisma.dc_patient_details.count({ where: { status: 'active' } }),
      prisma.dc_patient_details.count({ where: { status: 'unverified' } }),
      prisma.dc_users.groupBy({ by: ['ut_id_fk'], _count: true }),
      prisma.dc_patient_details.groupBy({ by: ['status'], _count: true }),
      prisma.dc_users.findMany({
        where: { reg_date: { gte: new Date(Date.now() - 30*24*60*60*1000) } },
        select: { user_id: true, f_name: true, l_name: true, email: true, ut_id_fk: true, reg_date: true },
        orderBy: { reg_date: 'desc' }, take: 10,
      }),
      prisma.dc_ehr_prescriptions.count({
        where: {
          pr_date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          is_deleted: false,
        },
      }),
    ]);

    const userTypeMap = { 1: 'technician', 2: 'account_admin', 3: 'clinician', 4: 'patient' };

    res.json({
      data: {
        counts: { total_users: totalUsers, total_patients: totalPatients, total_clinicians: totalClinicians, total_prescriptions: totalPrescriptions, active_patients: activePatients, unverified_patients: unverifiedPatients, prescriptions_this_month: prescriptionsThisMonth },
        users_by_type: usersByType.map(u => ({ type: userTypeMap[u.ut_id_fk] || 'unknown', count: u._count })),
        patients_by_status: patientsByStatus,
        recent_registrations: recentRegistrations,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getClinicianDashboard = async (req, res) => {
  try {
    const clinicianId = req.user.user_id;

    const [myPatients, activeMyPatients, unverifiedMyPatients, recentPrescriptions, myPatientsList] = await Promise.all([
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: clinicianId } }),
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: clinicianId, status: 'active' } }),
      prisma.dc_patient_details.count({ where: { assigned_clinician_id: clinicianId, status: 'unverified' } }),
      prisma.dc_ehr_prescriptions.findMany({
        where: { doctor_id_fk: clinicianId, is_deleted: false },
        include: { patient: { select: { user_id: true, f_name: true, l_name: true } }, medicines: { where: { is_deleted: false }, take: 2 } },
        orderBy: { pr_date: 'desc' }, take: 5,
      }),
      prisma.dc_users.findMany({
        where: { ut_id_fk: 4, patient_details: { assigned_clinician_id: clinicianId } },
        select: { user_id: true, f_name: true, l_name: true, email: true, patient_details: { select: { chart_no: true, status: true, attributes: { select: { dob: true, gender: true } } } } },
        orderBy: { reg_date: 'desc' }, take: 10,
      }),
    ]);

    res.json({ data: { counts: { total_patients: myPatients, active_patients: activeMyPatients, unverified_patients: unverifiedMyPatients }, recent_prescriptions: recentPrescriptions, my_patients: myPatientsList } });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

const getPatientStats = async (req, res) => {
  try {
    const { id } = req.params;
    const [totalPrescriptions, latestPrescription, attributes] = await Promise.all([
      prisma.dc_ehr_prescriptions.count({ where: { patient_id_fk: parseInt(id), is_deleted: false } }),
      prisma.dc_ehr_prescriptions.findFirst({ where: { patient_id_fk: parseInt(id), is_deleted: false }, include: { doctor: { select: { f_name: true, l_name: true } }, medicines: { where: { is_deleted: false } } }, orderBy: { pr_date: 'desc' } }),
      prisma.vf_attributes.findFirst({ where: { patient: { user_id_fk: parseInt(id) } }, include: { air_monitors: { include: { device: true } } } }),
    ]);

    res.json({ data: { total_prescriptions: totalPrescriptions, latest_prescription: latestPrescription, attributes } });
  } catch (error) {
    console.error('Patient stats error:', error);
    res.status(500).json({ error: 'Failed to fetch patient stats' });
  }
};

module.exports = { getSystemStats, getClinicianDashboard, getPatientStats };
