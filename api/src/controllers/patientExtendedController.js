const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check if patient exists by email, phone, or chart number
const patientExists = async (req, res) => {
  try {
    const { email, phone, chart_no } = req.query;
    const where = { ut_id_fk: 4 };
    
    if (email) where.email = email;
    if (phone) where.phone = phone;
    if (chart_no) where.patient_details = { chart_no };

    const patient = await prisma.dc_users.findFirst({
      where,
      select: { user_id: true, email: true, phone: true, f_name: true, l_name: true, patient_details: { select: { chart_no: true, status: true } } },
    });

    res.json({ exists: !!patient, data: patient || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check patient' });
  }
};

// Verify patient (for clinician)
const verifyPatient = async (req, res) => {
  try {
    const { chart_no, phone, access_code } = req.body;
    
    const patient = await prisma.dc_users.findFirst({
      where: { ut_id_fk: 4, patient_details: { chart_no } },
      select: { user_id: true, f_name: true, l_name: true, phone: true, patient_details: { select: { chart_no: true, status: true, access_code: true } } },
    });

    if (!patient) return res.status(404).json({ verified: false, error: 'Patient not found' });
    if (patient.phone !== phone) return res.status(400).json({ verified: false, error: 'Phone mismatch' });

    res.json({ verified: true, data: patient });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Get daily reminder patients
const getDailyReminderPatients = async (req, res) => {
  try {
    const patients = await prisma.dc_users.findMany({
      where: {
        ut_id_fk: 4,
        patient_details: { status: 'active', rpm_consent: true },
      },
      select: {
        user_id: true, f_name: true, l_name: true, email: true, phone: true,
        patient_details: { select: { chart_no: true, status: true, rpm_consent: true } },
      },
      take: 50,
    });
    res.json({ data: patients, total: patients.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Clinician control over patient
const clinicianControl = async (req, res) => {
  try {
    const { patient_id, action } = req.body;
    const clinicianId = req.user.user_id;

    const patient = await prisma.dc_patient_details.findFirst({
      where: { user_id_fk: parseInt(patient_id), assigned_clinician_id: clinicianId },
    });

    if (!patient) return res.status(403).json({ error: 'Not authorized for this patient' });

    const data = {};
    if (action === 'enable_rpm') data.rpm_consent = true;
    if (action === 'disable_rpm') data.rpm_consent = false;
    if (action === 'enable_web') data.is_web_allowed = true;
    if (action === 'disable_web') data.is_web_allowed = false;
    if (action === 'activate') data.status = 'active';
    if (action === 'deactivate') data.status = 'inactive';

    const updated = await prisma.dc_patient_details.update({
      where: { pd_id: patient.pd_id },
      data,
    });

    res.json({ message: 'Updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

// Air data endpoints (mock for now)
const getAirDataAwair = async (req, res) => {
  const { patient_id } = req.query;
  res.json({
    data: {
      patient_id: patient_id || 'all',
      source: 'awair',
      readings: [{ timestamp: new Date().toISOString(), score: 85, temp: 22.5, humidity: 55, co2: 450, voc: 120, pm25: 10 }],
    },
  });
};

const getAirDataBreezometer = async (req, res) => {
  const { patient_id } = req.query;
  res.json({
    data: {
      patient_id: patient_id || 'all',
      source: 'breezometer',
      readings: [{ timestamp: new Date().toISOString(), aqi: 45, pollen: 'low', pollutants: { pm25: 12, o3: 30, no2: 20 } }],
    },
  });
};

module.exports = { patientExists, verifyPatient, getDailyReminderPatients, clinicianControl, getAirDataAwair, getAirDataBreezometer };
