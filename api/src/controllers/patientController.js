const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');
const { generateUserName } = require('../utils/usernameGenerator');

const prisma = new PrismaClient();

// Get all patients with medical details
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, patient_group_id, assigned_clinician_id } = req.query;

    const where = { ut_id_fk: 4 }; // Only patients

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

    if (status) {
      where.patient_details = { ...where.patient_details, status };
    }

    if (patient_group_id) {
      where.patient_details = { ...where.patient_details, patient_group_id: parseInt(patient_group_id) };
    }

    if (assigned_clinician_id) {
      where.patient_details = { ...where.patient_details, assigned_clinician_id: parseInt(assigned_clinician_id) };
    }

    // 🔒 Clinicians only see their assigned patients
    // Admin (ut_id_fk=2) and Technician (ut_id_fk=1) see all
    if (req.user.ut_id_fk === 3) {
      where.patient_details = { ...where.patient_details, assigned_clinician_id: req.user.user_id };
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
          userName: true,
          user_status: { select: { name: true } },
          patient_details: {
            select: {
              pd_id: true,
              chart_no: true,
              blood_group: true,
              status: true,
              graph_view: true,
              rpm_consent: true,
              height: true,
              weight: true,
              patient_group: { select: { id: true, name: true } },
              assigned_clinician: { select: { user_id: true, f_name: true, l_name: true } },
              attributes: {
                select: {
                  id: true,
                  dob: true,
                  gender: true,
                  height: true,
                  weight: true,
                  ethnic_group: true,
                  lookup_table: true,
                  smoking: true,
                },
              },
            },
          },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    // Format patients to include attributes at top level
    const formattedPatients = patients.map(p => ({
      ...p,
      attributes: p.patient_details?.attributes || null,
    }));

    res.json({
      data: formattedPatients,
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
    const { page = 1, limit = 10, start_date, end_date } = req.query;

    let patientId = null;

    // Check if id is numeric
    if (/^\d+$/.test(id)) {
      patientId = parseInt(id);
    } else {
      // Search ONLY by userName
      const patient = await prisma.dc_users.findFirst({
        where: {
          ut_id_fk: 4,
          userName: id,
        },
      });

      if (patient) {
        patientId = patient.user_id;
      } else {
        // Return empty list instead of error
        return res.json({
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        });
      }
    }

    const where = {
      patient_id_fk: patientId,
      is_deleted: false,
    };

    if (start_date || end_date) {
      where.pr_date = {};
      if (start_date) where.pr_date.gte = new Date(start_date);
      if (end_date) where.pr_date.lte = new Date(end_date + 'T23:59:59Z');
    }

    const [prescriptions, total] = await Promise.all([
      prisma.dc_ehr_prescriptions.findMany({
        where,
        include: {
          doctor: { select: { user_id: true, f_name: true, l_name: true } },
          medicines: true,
        },
        orderBy: { pr_date: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.dc_ehr_prescriptions.count({ where }),
    ]);

    res.json({
      data: prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

const createPrescription = async (req, res) => {
  console.log('createPrescription req.body:', req.body);
  try {
    const { pharmacy_instruction, diagnosis, medicines } = req.body;
    const { id } = req.params;
    const doctorId = req.user?.user_id;

    let patientId = null;

    // Check if id is numeric
    if (/^\d+$/.test(id)) {
      patientId = parseInt(id);
    } else {
      // Search ONLY by userName
      const patient = await prisma.dc_users.findFirst({
        where: {
          ut_id_fk: 4,
          userName: id,
        },
      });

      if (patient) {
        patientId = patient.user_id;
      } else {
        return res.status(404).json({ error: 'Patient not found' });
      }
    }

    if (!doctorId || isNaN(doctorId)) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    const prescription = await prisma.dc_ehr_prescriptions.create({
      data: {
        pharmacy_instruction: pharmacy_instruction || '',
        diagnosis: diagnosis || '',
        patient_id_fk: patientId,
        doctor_id_fk: doctorId,
        medicines: medicines && medicines.length > 0 ? {
          create: medicines.map(m => ({
            type: m.type || null,
            drug: m.drug || 'N/A',
            dosage: m.dosage || 'N/A',
            frequency: m.frequency || 'N/A',
            quantity: m.quantity || '1',
            days: m.days || '1',
            units: m.units || null,
            direction: m.direction || 'N/A',
          })),
        } : undefined,
      },
      include: {
        doctor: { select: { user_id: true, f_name: true, l_name: true } },
        medicines: true,
      },
    });

    res.status(201).json({
      message: 'Prescription created',
      data: prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Failed to create prescription',
      message: error.message
    });
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
const createPatient = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      f_name, l_name, email, phone, password,
      dob, chart_no, blood_group, height, weight, gender,
      patient_group_id, assigned_clinician_id, status,
    } = body;

    const first_name = f_name || "";
    const last_name = l_name || "";
    const userEmail = email || phone || `patient-${Date.now()}@vitalflow.com`;
    const userPhone = phone || `phone-${crypto.randomBytes(8).toString("hex")}`;

    // Check for existing user by email
    const existingEmail = await prisma.dc_users.findUnique({ where: { email: userEmail } });
    if (existingEmail) {
      return res.status(409).json({ error: "User already exists", message: "A user with this email already exists", field: "email" });
    }

    // Check for existing user by phone
    const existingPhone = await prisma.dc_users.findUnique({ where: { phone: userPhone } });
    if (existingPhone) {
      return res.status(409).json({ error: "User already exists", message: "A user with this phone number already exists", field: "phone" });
    }

    const hashedPassword = await hashPassword(password || "TempPass123!");

    let chartNo = chart_no || crypto.randomBytes(4).toString("hex").toUpperCase();

    // Generate username from email
    const userName = await generateUserName(userEmail);

    const heightValue = height ? parseFloat(height) : null;
    const weightValue = weight ? parseFloat(weight) : null;
    const clinicianId = assigned_clinician_id ? parseInt(assigned_clinician_id) : null;
    const groupId = patient_group_id ? parseInt(patient_group_id) : null;

    // Create user with patient_details AND attributes
    const user = await prisma.dc_users.create({
      data: {
        f_name: first_name,
        l_name: last_name,
        email: userEmail,
        phone: userPhone,
        password: hashedPassword,
        userName,
        ut_id_fk: 4,
        us_id_fk: status === "active" ? 1 : 4,
        is_availible: true,
        patient_details: {
          create: {
            chart_no: chartNo,
            invite_code: chartNo,
            access_code: chartNo,
            assigned_clinician_id: clinicianId,
            status: status || "active",
            height: heightValue,
            weight: weightValue,
            blood_group: blood_group || null,
            patient_group_id: groupId,
            attributes: {
              create: {
                first_name: first_name,
                last_name: last_name,
                phone: userPhone,
                dob: dob || "",
                height: heightValue || 0,
                weight: weightValue,
                gender: gender || "",
                chart_number: chartNo,
              },
            },
          },
        },
      },
      include: {
        patient_details: {
          include: {
            attributes: true,
            assigned_clinician: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Patient created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create patient error:", error.message);
    if (error.code === "P2002") {
      const targets = error.meta?.target || [];
      let field = "field";
      if (targets.includes("email")) field = "email";
      else if (targets.includes("phone")) field = "phone";
      return res.status(409).json({ error: "User already exists", message: `A user with this ${field} already exists`, field });
    }
    res.status(400).json({ error: "Failed to create patient", message: error.message });
  }
};

// Get all clinicians for dropdown
const getClinicians = async (req, res) => {
  try {
    const clinicians = await prisma.dc_users.findMany({
      where: { ut_id_fk: 3 },
      select: {
        user_id: true,
        f_name: true,
        l_name: true,
        email: true,
        userName: true,
      },
      orderBy: { f_name: "asc" },
    });
    res.json({ data: clinicians });
  } catch (error) {
    console.error("Get clinicians error:", error);
    res.status(500).json({ error: "Failed to fetch clinicians" });
  }
};

// Create patient group
const createPatientGroup = async (req, res) => {
  try {
    const { name, account_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await prisma.vf_patient_group.create({
      data: {
        name,
        account_id: account_id ? parseInt(account_id) : 1,
        creation_date: new Date(),
      },
    });

    res.status(201).json({ message: "Group created", data: group });
  } catch (error) {
    console.error("Create patient group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  createAttributes,
  updateAttributes,
  getPrescriptions,
  createPrescription,
  getPatientGroups,
  createPatientGroup,
  getClinicians,
};
