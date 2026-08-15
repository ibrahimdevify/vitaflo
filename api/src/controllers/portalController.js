const { PrismaClient } = require('@prisma/client');

// Helper: resolve user ID from string (id, email, phone)
const resolveUserId = async (identifier) => {
  if (!identifier) return null;
  if (/^\d+$/.test(identifier)) return parseInt(identifier);
  const user = await prisma.dc_users.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }], ut_id_fk: 4 },
    select: { user_id: true },
  });
  return user?.user_id || null;
};
const prisma = new PrismaClient();

// ═══════════════════════
// SPIROMETRY
// ═══════════════════════

const getSpirometryByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { start, end, page = 1, limit = 20 } = req.query;

    // Resolve user ID (supports username, email, phone, or numeric)
    let userId;
    if (/^\d+$/.test(user_id)) {
      userId = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: {
          OR: [
            { email: user_id },
            { phone: user_id },
            { userName: user_id },
          ],
          ut_id_fk: 4
        },
        select: { user_id: true, f_name: true, l_name: true, userName: true },
      });
      if (!user) return res.json({ data: [], total: 0, patient: null });
      userId = user.user_id;
    }

    // Build where clause
    const where = {
      observation: {
        user_id: userId,
      },
      fvc: { not: null },
      fev1: { not: null },
    };

    if (start && end) {
      where.dbdate = { gte: new Date(start), lte: new Date(end) };
    }

    // Get total count
    const total = await prisma.portal_spirometry.count({ where });

    // Get paginated data
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await prisma.portal_spirometry.findMany({
      where,
      orderBy: { dbdate: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        observation: true,
        flows: true,
        volumes: true,
      },
    });

    // Format data for frontend
    const formattedData = data.map(s => ({
      id: s.id,
      dbdate: s.dbdate,
      fvc: s.fvc,
      fev1: s.fev1,
      pefr: s.pefr,
      fef2575: s.fef2575,
      fev6: s.fev6,
      fev1_perc: s.fev1_perc,
      quality_message: s.quality_message,
      symptom: s.symptom,
      btps: s.btps,
      temp_celsius: s.temp_celsius,
      fev1_acceptability: s.fev1_acceptability,
      fvc_acceptability: s.fvc_acceptability,
      is_post_bronchodilator: s.observation?.is_post_bronchodilator || false,
      height: s.observation?.height || null,
      fev1_grade: s.observation?.fev1_grade || null,
      fvc_grade: s.observation?.fvc_grade || null,
      observation_id: s.observation_id,
      flow_count: s.flows?.length || 0,
      volume_count: s.volumes?.length || 0,
    }));

    // Get patient info
    const patient = await prisma.dc_users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        f_name: true,
        l_name: true,
        userName: true,
        email: true,
        patient_details: {
          select: {
            attributes: {
              select: {
                dob: true,
                gender: true,
                height: true,
                weight: true,
              }
            }
          }
        }
      }
    });

    res.json({
      data: formattedData,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      patient: patient ? {
        id: patient.user_id,
        name: `${patient.f_name} ${patient.l_name}`.trim(),
        userName: patient.userName,
        email: patient.email,
        dob: patient.patient_details?.attributes?.dob || null,
        gender: patient.patient_details?.attributes?.gender || null,
      } : null,
    });
  } catch (error) {
    console.error('Get spirometry by user error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSpirometryLatest = async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT d.user_id, MAX(d.dbdate) as lastblow 
      FROM (SELECT u.user_id, s.dbdate FROM portal_spirometry s
      LEFT JOIN portal_observation o ON o.id = s.observation_id
      LEFT JOIN dc_users u ON u.user_id = o.user_id) as d 
      GROUP BY user_id`;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSpirometryAll = async (req, res) => {
  try {
    const { user } = req.query;
    const where = user ? { observation: { user_id: parseInt(user) } } : {};
    const data = await prisma.portal_spirometry.findMany({
      where, orderBy: { dbdate: 'asc' }, take: 100,
      include: { observation: true },
    });
    res.json({ data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const syncSpirometry = async (req, res) => {
  try {
    const { timezone, isPostBronchodilator, sessionGrade, results } = req.body;
    const user_id = req.user.user_id;
    const grade = typeof sessionGrade === 'string' ? JSON.parse(sessionGrade) : (sessionGrade || {});
    const observation = await prisma.portal_observation.create({
      data: {
        user_id,
        fev1_grade: grade?.fev1Grade,
        fvc_grade: grade?.fvcGrade,
        is_post_bronchodilator: isPostBronchodilator === 'true',
        dbdate: new Date(),
      },
    });
    const spirometries = [];
    for (const result of (results || [])) {
      const spiro = await prisma.portal_spirometry.create({
        data: {
          observation_id: observation.id,
          fvc: result.fvc, fev1: result.fev1, pefr: result.pefr,
          fef2575: result.fef2575, fev6: result.fev6,
          fev1_perc: result.fev1Perc, btps: result.btps || 1.0,
          temp_celsius: result.tempCelsius || 23.0,
          symptom: result.symptom || '',
          quality_message: result.qualityMessage || 1,
          fev1_acceptability: result.fev1Acceptability || 1,
          fvc_acceptability: result.fvcAcceptability || 1,
          dbdate: new Date(),
        },
      });
      if (result.flows) {
        for (const flow of result.flows) {
          await prisma.portal_flow.create({
            data: { spirometry_id: spiro.id, time: flow.time, value: flow.value, volume: flow.volume || 0, dbdate: new Date() },
          });
        }
      }
      if (result.volumes) {
        for (const vol of result.volumes) {
          await prisma.portal_volume.create({
            data: { spirometry_id: spiro.id, volume: vol.volume, time: vol.time },
          });
        }
      }
      spirometries.push(spiro);
    }
    res.status(201).json({ message: 'Spirometry synced', observation_id: observation.id, spirometries: spirometries.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════
// OBSERVATIONS
// ═══════════════════════

const getObservations = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? { user_id: parseInt(user_id) } : {};
    const data = await prisma.portal_observation.findMany({
      where, orderBy: { dbdate: 'desc' }, take: 50,
      include: { spirometries: { take: 1 } },
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════
// HEART RATE
// ═══════════════════════

const getHeartRate = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? { user_id: parseInt(user_id) } : {};
    const data = await prisma.portal_heart_rate_observations.findMany({
      where, orderBy: { dbdate: 'desc' }, include: { points: true },
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const syncHeartRate = async (req, res) => {
  try {
    const { points } = req.body;
    const obs = await prisma.portal_heart_rate_observations.create({
      data: {
        user_id: req.user.user_id,
        dbdate: new Date(),
        points: { create: (points || []).map(p => ({ value: p.value, time: p.time })) },
      },
      include: { points: true },
    });
    res.status(201).json({ message: 'Heart rate synced', data: obs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════
// STEPS
// ═══════════════════════

const getSteps = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? { user_id: parseInt(user_id) } : {};
    const data = await prisma.portal_steps_observations.findMany({
      where, orderBy: { dbdate: 'desc' }, take: 100,
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const syncSteps = async (req, res) => {
  try {
    const { steps } = req.body;
    const obs = await prisma.portal_steps_observations.create({
      data: { user_id: req.user.user_id, steps: parseInt(steps) || 0, dbdate: new Date() },
    });
    res.status(201).json({ message: 'Steps synced', data: obs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════
// NOTES
// ═══════════════════════

const getNotes = async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10, start_date, end_date } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Resolve user ID (supports username, email, or numeric)
    let userId;
    if (/^\d+$/.test(user_id)) {
      userId = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: { 
          OR: [
            { userName: user_id },
            { email: user_id },
          ], 
          ut_id_fk: 4 
        },
        select: { user_id: true, f_name: true, l_name: true, userName: true },
      });
      if (!user) return res.json({ data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
      userId = user.user_id;
    }
    
    const where = { user_id: userId };
    
    if (start_date || end_date) {
      where.dbdate = {};
      if (start_date) where.dbdate.gte = new Date(start_date);
      if (end_date) where.dbdate.lte = new Date(end_date + "T23:59:59Z");
    }
    
    const [notes, total] = await Promise.all([
      prisma.portal_notes.findMany({
        where,
        orderBy: { dbdate: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.portal_notes.count({ where }),
    ]);
    
    res.json({
      data: notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};
const createNote = async (req, res) => {
  try {
    const { user_id, text, page } = req.body;
    
    if (!user_id || !text) {
      return res.status(400).json({ error: "User ID and text are required" });
    }
    
    // Resolve user ID (supports username, email, or numeric)
    let userId;
    if (/^\d+$/.test(String(user_id))) {
      userId = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: { 
          OR: [
            { userName: String(user_id) },
            { email: String(user_id) },
          ], 
          ut_id_fk: 4 
        },
        select: { user_id: true },
      });
      if (!user) return res.status(404).json({ error: "Patient not found" });
      userId = user.user_id;
    }
    
    const note = await prisma.portal_notes.create({
      data: {
        user_id: userId,
        text: text,
        page: page || "general",
        dbdate: new Date(),
        recorded_date: new Date(),
      },
    });
    
    res.status(201).json({ message: "Note created", data: note });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

// ═══════════════════════
// AIR QUALITY
// ═══════════════════════

const getAirQuality = async (req, res) => {
  try {
    const { user, start_date, end_date } = req.query;
    const where = {};
    if (user) where.user_id = parseInt(user);
    const data = await prisma.portal_indoor_air_quality.findMany({
      where, orderBy: { dbdate: 'desc' }, take: 100,
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════
// DASHBOARD
// ═══════════════════════

const getDaysOfSpirometry = async (req, res) => {
  try {
    const { user } = req.params;
    const count = await prisma.portal_spirometry.count({ where: { observation: { user_id: parseInt(user) } } });
    res.json({ total_spirometries: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSpirometryReadings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, start_date, end_date, user_id } = req.query;

    const where = {};

    // Search by user ID
    if (search) {
      where.observation = {
        user: {
          OR: [
            { user_id: isNaN(search) ? undefined : parseInt(search) },
            { email: { contains: search } },
            { f_name: { contains: search } },
            { l_name: { contains: search } },
          ]
        }
      };
    }

    // Filter by user ID
    if (user_id) {
      where.observation = { ...where.observation, user_id: parseInt(user_id) };
    }

    // Date range
    if (start_date || end_date) {
      where.dbdate = {};
      if (start_date) where.dbdate.gte = new Date(start_date);
      if (end_date) where.dbdate.lte = new Date(end_date + 'T23:59:59.999Z');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      prisma.portal_spirometry.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { dbdate: 'desc' },
        select: {
          id: true,
          dbdate: true,
          fev1: true,
          fvc: true,
          pefr: true,
          fef2575: true,
          fev6: true,
          fev1_perc: true,
          observation: {
            select: {
              user_id: true,
              user: {
                select: {
                  f_name: true,
                  l_name: true,
                  email: true,
                }
              }
            }
          }
        },
      }),
      prisma.portal_spirometry.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Spirometry readings error:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
};

// Create alert
const createAlert = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;
    
    if (!user_id || !message) {
      return res.status(400).json({ error: "User ID and message are required" });
    }
    
    // Resolve user ID
    let userId;
    if (/^\d+$/.test(String(user_id))) {
      userId = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: { 
          OR: [
            { userName: String(user_id) },
            { email: String(user_id) },
          ], 
          ut_id_fk: 4 
        },
        select: { user_id: true },
      });
      if (!user) return res.status(404).json({ error: "Patient not found" });
      userId = user.user_id;
    }
    
    const alert = await prisma.portal_alert.create({
      data: {
        user_id: userId,
        message: message,
        created: new Date(),
        is_read: false,
      },
      include: {
        user: {
          select: {
            user_id: true,
            f_name: true,
            l_name: true,
            userName: true,
          },
        },
      },
    });
    
    res.status(201).json({ message: "Alert created", data: alert });
  } catch (error) {
    console.error("Create alert error:", error);
    res.status(500).json({ error: "Failed to create alert" });
  }
};

// Get alerts with pagination
const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_read, start_date, end_date } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { message: { contains: search } },
        { user: { f_name: { contains: search } } },
        { user: { l_name: { contains: search } } },
        { user: { userName: { contains: search } } },
      ];
    }
    
    if (is_read !== undefined && is_read !== "") {
      where.is_read = is_read === "true";
    }
    
    if (start_date || end_date) {
      where.created = {};
      if (start_date) where.created.gte = new Date(start_date);
      if (end_date) where.created.lte = new Date(end_date + "T23:59:59Z");
    }
    
    const [alerts, total] = await Promise.all([
      prisma.portal_alert.findMany({
        where,
        include: {
          user: {
            select: {
              user_id: true,
              f_name: true,
              l_name: true,
              userName: true,
              email: true,
            },
          },
        },
        orderBy: { created: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.portal_alert.count({ where }),
    ]);
    
    res.json({
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// Mark single alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await prisma.portal_alert.update({
      where: { id: parseInt(alertId) },
      data: { is_read: true },
    });
    
    res.json({ message: "Alert marked as read", data: alert });
  } catch (error) {
    console.error("Mark alert as read error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.status(500).json({ error: "Failed to update alert" });
  }
};

// Mark all alerts as read
const markAllAlertsAsRead = async (req, res) => {
  try {
    const result = await prisma.portal_alert.updateMany({
      where: { is_read: false },
      data: { is_read: true },
    });
    
    res.json({ message: "All alerts marked as read", count: result.count });
  } catch (error) {
    console.error("Mark all alerts as read error:", error);
    res.status(500).json({ error: "Failed to update alerts" });
  }
};

module.exports = {
  getSpirometryByUser, getSpirometryLatest, getSpirometryAll, syncSpirometry,
  getObservations, getHeartRate, syncHeartRate, getSteps, syncSteps,
  getNotes, createNote, getAirQuality,
  getDaysOfSpirometry, getSpirometryReadings,
  getAlerts, createAlert, markAlertAsRead, markAllAlertsAsRead,
};
