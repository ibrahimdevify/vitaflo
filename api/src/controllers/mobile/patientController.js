const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken, generateRefreshToken } = require('../../utils/jwt');
const { generateAccessToken } = require('../../utils/token');
const crypto = require('crypto');

const prisma = new PrismaClient();

const buildAttributes = (user, attrs) => {
  const result = {
    first_name: attrs?.first_name || user.f_name || '',
    last_name: attrs?.last_name || user.l_name || '',
    email: user.email || '',
    phone: user.phone || '',
  };
  if (attrs?.dob) result.dob = attrs.dob;
  if (attrs?.gender) result.gender = attrs.gender;
  if (attrs?.height) result.height = parseFloat(attrs.height);
  if (attrs?.weight) result.weight = parseFloat(attrs.weight);
  if (attrs?.ethnic_group) result.ethnic_group = attrs.ethnic_group;
  if (attrs?.race) result.race = attrs.race;
  return result;
};

const buildClinicianAttributes = (user) => ({
  first_name: user.f_name || '',
  last_name: user.l_name || '',
  email: user.email || '',
  phone: user.phone || '',
});
const buildAccountAttributes = (user, patientDetails) => ({
  account_name: `${user.f_name} ${user.l_name}`.trim(),
  breezometer: patientDetails?.rpm_consent || false,
  awair: !!patientDetails?.awair_refresh_token,
  bronchodilator_responsiveness_testing: false,
});

const patientLogin = async (req, res) => {
  try {
    const { username, password, fcm_token } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await prisma.dc_users.findFirst({
      where: { OR: [{ email: username }, { phone: username }], ut_id_fk: 4 },
      include: { patient_details: { include: { attributes: true } } },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Username or password is incorrect' });
    }
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Username or password is incorrect' });
    }
    const accessToken = generateAccessToken();
    await prisma.vf_session.create({
      data: { access_token: accessToken, user_id: user.user_id, last_action: new Date() },
    });
    if (fcm_token) {
      await prisma.dc_fcm_token.upsert({
        where: { ft_id: user.user_id },
        update: { fcm_token, is_enabled: true, updated_date: new Date() },
        create: { fcm_token, device: 'android', user_id_fk: user.user_id, is_enabled: true },
      }).catch(() => {});
    }
    // FLAT response - no "user" wrapper
    res.json({
      access_token: accessToken,
      user_id: String(user.user_id),
      username: user.email,
      type: 'patient',
      attributes: buildAttributes(user, user.patient_details?.attributes),
      account_attributes: buildAccountAttributes(user, user.patient_details),
      extra: {},
    });
  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const clinicianLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await prisma.dc_users.findFirst({
      where: { OR: [{ email: username }, { phone: username }], ut_id_fk: 3 },
      include: { doctor_details: { include: { hospital: true } } },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Username or password is incorrect' });
    }
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Username or password is incorrect' });
    }
    const accessToken = generateAccessToken();
    await prisma.vf_session.create({
      data: { access_token: accessToken, user_id: user.user_id, last_action: new Date() },
    });
    const extra = {};
    const hospital = user.doctor_details?.hospital;
    if (hospital) {
      const attrs = await prisma.vf_account_attributes.findUnique({
        where: { account_id: hospital.id },
      }).catch(() => null);
      if (attrs?.extra) {
        try {
          const ed = typeof attrs.extra === 'string' ? JSON.parse(attrs.extra) : attrs.extra;
          if (ed.nextgen) extra.nextgen = ed.nextgen;
        } catch {}
      }
    }
    // FLAT response
    res.json({
      access_token: accessToken,
      user_id: String(user.user_id),
      username: user.email,
      type: 'clinician',
      attributes: buildClinicianAttributes(user),
      account_attributes: { account_name: `${user.f_name} ${user.l_name}`.trim() },
      extra,
    });
  } catch (error) {
    console.error('Clinician login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const body = req.body || {};
    const user = await prisma.dc_users.findUnique({
      where: { user_id: userId },
      include: {
        patient_details: { include: { attributes: true } },
        doctor_details: { include: { hospital: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (body.fcm_token) {
      await prisma.dc_fcm_token.upsert({
        where: { ft_id: userId },
        update: { fcm_token: body.fcm_token, is_enabled: true, updated_date: new Date() },
        create: { fcm_token: body.fcm_token, device: 'android', user_id_fk: userId, is_enabled: true },
      }).catch(() => {});
    }
    const isPatient = user.ut_id_fk === 4;
    // FLAT response
    res.json({
      access_token: req.headers.vitalfloauth || '',
      user_id: String(user.user_id),
      username: user.email,
      type: isPatient ? 'patient' : 'clinician',
      attributes: isPatient
        ? buildAttributes(user, user.patient_details?.attributes)
        : buildClinicianAttributes(user),
      account_attributes: isPatient
        ? buildAccountAttributes(user, user.patient_details)
        : { account_name: `${user.f_name} ${user.l_name}`.trim() },
      extra: {},
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

const verifyPatient = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const patient = await prisma.dc_patient_details.findFirst({
      where: { OR: [{ access_code: accessCode }, { chart_no: accessCode }, { invite_code: accessCode }] },
      include: { user: true },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ verified: true, patient_id: String(patient.user.user_id), message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

const patientExists = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const patient = await prisma.dc_patient_details.findFirst({
      where: { OR: [{ access_code: accessCode }, { chart_no: accessCode }, { invite_code: accessCode }] },
      include: { user: { include: { sessions: { orderBy: { created: 'desc' }, take: 1 } } } },
    });
    if (!patient) return res.json({ exists: false, has_logged_in: false });
    res.json({ exists: true, has_logged_in: patient.user.sessions.length > 0, patient_id: String(patient.user.user_id) });
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
};

const updateCredentials = async (req, res) => {
  try {
    const { user_id } = req.params;
    const body = req.body || {};
    const data = {};
    if (body.username) data.email = body.username;
    if (body.password) data.password = await hashPassword(body.password);
    if (body.tos_acceptance) data.profile_update_date = new Date();
    await prisma.dc_users.update({ where: { user_id: parseInt(user_id) }, data });
    res.json({ success: true, message: 'Credentials updated' });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const updateDemographics = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { attributes } = req.body || {};
    if (!attributes) return res.status(400).json({ error: 'Attributes required' });
    const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: parseInt(user_id) } });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const attrData = {};
    if (attributes.height !== undefined) attrData.height = parseFloat(parseFloat(attributes.height).toFixed(2));
    if (attributes.weight !== undefined) attrData.weight = parseFloat(parseFloat(attributes.weight).toFixed(2));
    if (attributes.ethnicity) attrData.ethnic_group = attributes.ethnicity;
    if (attributes.race) attrData.race = attributes.race;
    if (attributes.gender) attrData.gender = attributes.gender;
    if (attributes.date_of_birth) attrData.dob = attributes.date_of_birth;
    if (attributes.first_name) attrData.first_name = attributes.first_name;
    if (attributes.last_name) attrData.last_name = attributes.last_name;
    await prisma.vf_attributes.upsert({
      where: { pd_id: patient.pd_id },
      update: attrData,
      create: { pd_id: patient.pd_id, first_name: '', last_name: '', ...attrData },
    });
    res.json({ success: true, attributes: attrData });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const addAwairToken = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { awair_refresh_token } = req.body || {};
    await prisma.dc_patient_details.update({
      where: { user_id_fk: parseInt(user_id) },
      data: { awair_refresh_token },
    });
    res.json({ success: true, message: 'Awair token saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save token' });
  }
};

const saveOnboarding = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { address } = req.body || {};
    const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: parseInt(user_id) } });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (address && address.length > 0) {
      const addr = address[0];
      await prisma.vf_attributes.upsert({
        where: { pd_id: patient.pd_id },
        update: {},
        create: { pd_id: patient.pd_id, first_name: '', last_name: '' },
      });
      if (addr.street || addr.city) {
        await prisma.vf_address.create({
          data: { street: addr.street || '', city: addr.city || '', state: addr.state || '', zip: addr.zipcode || '', attributes_id: patient.pd_id },
        }).catch(() => {});
      }
    }
    res.json({ success: true, onboarding_complete: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save onboarding' });
  }
};

const getClinicianPatients = async (req, res) => {
  try {
    const clinicianId = req.user.user_id;

    const patients = await prisma.dc_users.findMany({
      where: {
        ut_id_fk: 4,
        patient_details: { assigned_clinician_id: clinicianId },
      },
      include: {
        patient_details: {
          include: {
            attributes: {
              include: { addresses: true },
            },
          },
        },
      },
    });

    const result = patients.map(p => {
      const attr = p.patient_details?.attributes;
      const addresses = attr?.addresses || [];
      return {
        id: String(p.user_id),
        username: p.email || '',
        email: p.email || '',
        is_active: p.is_availible || false,
        survey: null,
        is_clinician_controlled: false,
        attributes: {
          id: attr ? String(attr.id) : '',
          first_name: attr?.first_name || p.f_name || '',
          last_name: attr?.last_name || p.l_name || '',
          phone: p.phone || '',
          dob: attr?.dob || null,
          gender: attr?.gender || null,
          height: attr?.height || null,
          weight: attr?.weight || null,
          lookup_table: attr?.ethnic_group || attr?.race || '',
          extra: {},
        },
        address: addresses.map(a => ({
          street: a.street || '',
          city: a.city || '',
          state: a.state || '',
          zip: a.zip || '',
        })),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get clinician patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(req.params.patient_id), ut_id_fk: 4 },
      include: {
        patient_details: { include: { attributes: true, assigned_clinician: { select: { user_id: true, f_name: true, l_name: true } } } },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const attr = patient.patient_details?.attributes;
    // Flat response - no wrapper
    res.json({
      id: String(patient.user_id),
      username: patient.email,
      email: patient.email,
      first_name: patient.f_name,
      last_name: patient.l_name,
      type: 'patient',
      attributes: {
        gender: attr?.gender || null,
        date_of_birth: attr?.dob || null,
        height: attr?.height || null,
        weight: attr?.weight || null,
      },
      account_attributes: buildAccountAttributes(patient, patient.patient_details),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

const createPatient = async (req, res) => {
  try {
    const body = req.body || {};
    const attrs = body.attributes || {};
    const username = body.username || "";
    const password = body.password || "";
    const first_name = attrs.first_name || "";
    const last_name = attrs.last_name || "";
    const email = attrs.email || body.email || username;
    const phone = attrs.phone || attrs.chart_number || body.phone || "phone-" + crypto.randomBytes(8).toString("hex");
    const clinician_id = body.assigned_clinician || body.clinician_id || null;
    const access_code = attrs.chart_number || "";

    // Validate required fields
    if (!username && !email) {
      return res.status(400).json({ error: 'Username or email required', message: 'Please provide username or email' });
    }

    const userEmail = email || username;
    const userPhone = phone || 'phone-' + crypto.randomBytes(8).toString('hex');

    // Check for existing user by email
    const existingEmail = await prisma.dc_users.findUnique({ where: { email: userEmail } });
    if (existingEmail) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
        field: 'email',
      });
    }

    // Check for existing user by phone (if phone provided)
    if (userPhone) {
      const existingPhone = await prisma.dc_users.findUnique({ where: { phone: userPhone } });
      if (existingPhone) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'A user with this phone number already exists',
          field: 'phone',
        });
      }
    }

    const hashedPassword = await hashPassword(password || 'TempPass123!');

    // Sanitize chart number
    let chartNo = access_code || crypto.randomBytes(4).toString('hex').toUpperCase();
    if (attrs?.chart_number) {
      chartNo = String(attrs.chart_number).substring(0, 30);
    }

    const user = await prisma.dc_users.create({
      data: {
        f_name: first_name || '',
        l_name: last_name || '',
        email: userEmail,
        phone: userPhone,
        password: hashedPassword,
        ut_id_fk: 4,
        us_id_fk: 1,
        is_availible: true,
        patient_details: {
          create: {
            chart_no: chartNo,
            invite_code: chartNo,
            access_code: access_code || null,
            assigned_clinician_id: clinician_id ? parseInt(clinician_id) : null,
            status: 'active',
          },
        },
      },
    });

    res.status(201).json({
      id: String(user.user_id),
      user_id: String(user.user_id),
      username: user.email,
      email: user.email,
      status: 'In-Clinic',
      message: 'Patient created successfully',
      attributes: {
        first_name: user.f_name,
        last_name: user.l_name,
        dob: attrs?.dob || null,
        chart_number: user.patient_details?.chart_no || '',
      },
      access_code: access_code || null,
    });
  } catch (error) {
    console.error('Create patient error:', error.message);
    if (error.code === 'P2002') {
      const targets = error.meta?.target || [];
      let field = 'field';
      if (targets.includes('email')) field = 'email';
      else if (targets.includes('phone')) field = 'phone';
      else if (targets.length > 0) field = targets[0];

      const messages = {
        email: 'A user with this email already exists',
        phone: 'A user with this phone number already exists',
      };

      return res.status(409).json({
        error: 'User already exists',
        message: messages[field] || 'A user with this ' + field + ' already exists',
        field: field,
      });
    }
    res.status(400).json({
      error: 'Failed to create patient',
      message: error.message,
    });
  }
};

const clinicianControl = async (req, res) => {
  try {
    const patient = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(req.params.patient_id), ut_id_fk: 4 },
      include: { patient_details: { include: { attributes: true } } },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const accessToken = generateAccessToken();
    await prisma.vf_session.create({
      data: { access_token: accessToken, user_id: patient.user_id, clinician_id: req.user.user_id, last_action: new Date() },
    });
    // FLAT response
    res.json({
      access_token: accessToken, user_id: String(patient.user_id), username: patient.email, type: 'patient',
      attributes: buildAttributes(patient, patient.patient_details?.attributes),
      account_attributes: buildAccountAttributes(patient, patient.patient_details),
      extra: { is_clinician_controlled: true, controlling_clinician_id: String(req.user.user_id) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to take control' });
  }
};

const getClinicianById = async (req, res) => {
  try {
    const clinician = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(req.params.clinician_id), ut_id_fk: 3 },
      include: { doctor_details: { include: { hospital: true } } },
    });
    if (!clinician) return res.status(404).json({ error: 'Clinician not found' });
    // Fetch patient groups
    const patientGroups = await prisma.vf_patient_group.findMany({
      where: { account_id: clinician.doctor_details?.h_id_fk || 1 },
      select: { id: true, name: true, creation_date: true, account_id: true },
    });

    // If no groups, return a default
    const groups = patientGroups.length > 0 ? patientGroups : [{
      id: 1,
      name: 'General Patients',
      creation_date: new Date().toISOString(),
      account: '1',
    }];

    res.json({
      id: String(clinician.user_id),
      user_id: String(clinician.user_id),
      username: clinician.email,
      attributes: buildClinicianAttributes(clinician),
      npi_number: clinician.doctor_details?.license_no || '',
      clinic_name: clinician.doctor_details?.hospital?.name || '',
      specialty: clinician.doctor_details?.is_specialist ? 'Specialist' : 'General',
      patient_groups: groups.map(g => ({
        id: String(g.id),
        name: g.name,
        creation_date: g.creation_date,
        account: String(g.account_id || '1'),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinician' });
  }
};

module.exports = {
  patientLogin, clinicianLogin, getMe, verifyPatient, patientExists,
  updateCredentials, updateDemographics, addAwairToken, saveOnboarding,
  getClinicianPatients, getPatientById, createPatient, clinicianControl, getClinicianById,
};
