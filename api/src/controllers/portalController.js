const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ═══════════════════════
// SPIROMETRY
// ═══════════════════════

const getSpirometryByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { start, end } = req.query;
    const where = { observation: { user_id: parseInt(user_id) } };
    if (start && end) where.dbdate = { gte: new Date(start), lte: new Date(end) };
    const data = await prisma.portal_spirometry.findMany({
      where, orderBy: { dbdate: 'asc' },
      include: { observation: true, flows: true, volumes: true },
    });
    res.json({ data, total: data.length });
  } catch (error) {
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
      where, orderBy: { dbdate: 'asc' },
      include: { observation: true, flows: true, volumes: true },
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
    const { user_id } = req.query;
    const where = user_id ? { user_id: parseInt(user_id) } : {};
    const data = await prisma.portal_notes.findMany({
      where, orderBy: { dbdate: 'desc' }, take: 50,
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { user_id, text, page } = req.body;
    const note = await prisma.portal_notes.create({
      data: { user_id: parseInt(user_id), text, page, dbdate: new Date(), recorded_date: new Date() },
    });
    res.status(201).json({ message: 'Note created', data: note });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const data = await prisma.portal_spirometry.findMany({
      orderBy: { dbdate: 'desc' }, take: 500,
      select: { id: true, dbdate: true, fev1: true, fvc: true, pefr: true, observation: { select: { user_id: true } } },
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSpirometryByUser, getSpirometryLatest, getSpirometryAll, syncSpirometry,
  getObservations, getHeartRate, syncHeartRate, getSteps, syncSteps,
  getNotes, createNote, getAirQuality,
  getDaysOfSpirometry, getSpirometryReadings,
};
