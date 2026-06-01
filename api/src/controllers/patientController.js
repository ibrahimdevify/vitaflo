const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all patients with medical details
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, patient_group_id, assigned_clinician_id } = req.query;

    const where = { ut_id_fk: 4 }; // Only patients

    if (search) {
      where.OR = [
        { f_name: { contains: search } },
        { l_name: { contains: search } },
        { email: { contains: search } },
        { patient_details: { chart_no: { contains: search } } },
      ];
    }

    if (status) {
      where.patient_details = { ...where.patient_details, status };
    }

    if (patient_group_id) {
      where.patient_details = { ...where.patient_details, patient_group_id: parseInt(patient_group_id) };
    }

    if (assigned_clinician_id) {
      where.patient_details = { ...where.patient_details, assigned_clinician_id: parseInt(assigned_clinician_id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [patients, total] = await Promise.all([
      prisma.dc_users.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { reg_date: 'desc' },
        select: {
          user_id: true,
          f_name: true,
          l_name: true,
          email: true,
          phone: true,
          profile_pic: true,
          is_rpm_allow: true,
          reg_date: true,
          user_status: { select: { name: true } },
          patient_details: {
            select: {
              pd_id: true,
              chart_no: true,
              blood_group: true,
              status: true,
              graph_view: true,
              rpm_consent: true,
              patient_group: { select: { id: true, name: true } },
              assigned_clinician: { select: { user_id: true, f_name: true, l_name: true } },
            },
          },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    res.json({
      data: patients,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Get single patient with full medical details
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(id), ut_id_fk: 4 },
      select: {
        user_id: true, f_name: true, l_name: true, email: true, phone: true,
        profile_pic: true, is_rpm_allow: true, reg_date: true,
        user_status: { select: { name: true } },
        user_details: {
          include: { gender: true, city: true, martial: true },
        },
        patient_details: {
          include: {
            patient_group: true,
            assigned_clinician: { select: { user_id: true, f_name: true, l_name: true, email: true } },
            attributes: {
              include: {
                addresses: true,
                air_monitors: { include: { device: true } },
              },
            },
          },
        },
        prescriptions_patient: {
          where: { is_deleted: false },
          include: {
            doctor: { select: { user_id: true, f_name: true, l_name: true } },
            medicines: { where: { is_deleted: false } },
          },
          orderBy: { pr_date: 'desc' },
        },
        fcm_tokens: { where: { is_enabled: true } },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ data: patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

// Create medical attributes for patient
const createAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, phone, dob, height, weight,
      gender, ethnic_group, smoking, chart_number, account_type,
      welcome_method, addresses, air_monitors,
    } = req.body;

    // Check patient exists
    const patient = await prisma.dc_patient_details.findUnique({
      where: { pd_id: parseInt(id) },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if attributes already exist
    const existing = await prisma.vf_attributes.findUnique({
      where: { pd_id: parseInt(id) },
    });

    if (existing) {
      return res.status(400).json({ error: 'Attributes already exist. Use update.' });
    }

    const attributes = await prisma.vf_attributes.create({
      data: {
        first_name: first_name || patient.chart_no || '',
        last_name: last_name || '',
        phone: phone || null,
        dob: dob || '',
        height: height || 0,
        weight: weight || null,
        gender: gender || '',
        ethnic_group: ethnic_group || '',
        smoking: smoking || false,
        chart_number: chart_number || patient.chart_no,
        account_type: account_type || 'test',
        welcome_method: welcome_method || 'text',
        pd_id: parseInt(id),
        addresses: addresses ? {
          create: addresses.map(a => ({
            street: a.street || '',
            city: a.city || '',
            state: a.state || '',
            zip: a.zip || '',
          })),
        } : undefined,
        air_monitors: air_monitors ? {
          create: air_monitors.map(am => ({
            monitor_id: am.monitor_id || '',
            label: am.label || '',
            dev_id: am.dev_id || null,
          })),
        } : undefined,
      },
      include: {
        addresses: true,
        air_monitors: { include: { device: true } },
      },
    });

    res.status(201).json({ message: 'Patient attributes created', data: attributes });
  } catch (error) {
    console.error('Create attributes error:', error);
    res.status(500).json({ error: 'Failed to create attributes' });
  }
};

// Update medical attributes
const updateAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove nested objects for separate handling
    const { addresses, air_monitors, ...attrData } = updateData;

    const attributes = await prisma.vf_attributes.update({
      where: { pd_id: parseInt(id) },
      data: attrData,
      include: { addresses: true, air_monitors: true },
    });

    res.json({ message: 'Attributes updated', data: attributes });
  } catch (error) {
    console.error('Update attributes error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attributes not found' });
    }
    res.status(500).json({ error: 'Failed to update attributes' });
  }
};

// Get patient prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const { id } = req.params;

    const prescriptions = await prisma.dc_ehr_prescriptions.findMany({
      where: {
        patient_id_fk: parseInt(id),
        is_deleted: false,
      },
      include: {
        doctor: { select: { user_id: true, f_name: true, l_name: true } },
        medicines: { where: { is_deleted: false } },
      },
      orderBy: { pr_date: 'desc' },
    });

    res.json({ data: prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

// Create prescription
const createPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacy_instruction, diagnosis, doctor_id_fk, medicines } = req.body;

    const prescription = await prisma.dc_ehr_prescriptions.create({
      data: {
        pharmacy_instruction: pharmacy_instruction || '',
        diagnosis: diagnosis || '',
        patient_id_fk: parseInt(id),
        doctor_id_fk: doctor_id_fk || req.user.user_id,
        medicines: medicines ? {
          create: medicines.map(m => ({
            type: m.type || null,
            drug: m.drug,
            dosage: m.dosage,
            frequency: m.frequency,
            quantity: m.quantity,
            days: m.days,
            units: m.units || null,
            direction: m.direction,
          })),
        } : undefined,
      },
      include: {
        doctor: { select: { user_id: true, f_name: true, l_name: true } },
        medicines: true,
      },
    });

    res.status(201).json({ message: 'Prescription created', data: prescription });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
};

// Get patient groups
const getPatientGroups = async (req, res) => {
  try {
    const groups = await prisma.vf_patient_group.findMany({
      include: {
        account: { select: { id: true, name: true } },
        _count: { select: { patients: true } },
      },
    });
    res.json({ data: groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

// Create patient group
const createPatientGroup = async (req, res) => {
  try {
    const { name, account_id } = req.body;
    const group = await prisma.vf_patient_group.create({
      data: { name, account_id },
    });
    res.status(201).json({ message: 'Group created', data: group });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createAttributes,
  updateAttributes,
  getPrescriptions,
  createPrescription,
  getPatientGroups,
  createPatientGroup,
};
