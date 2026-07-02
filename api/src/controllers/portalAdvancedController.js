const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ═══════════════════════════════
// 📈 TRENDS
// ═══════════════════════════════

const getSpirometryTrends = async (req, res) => {
  try {
    const { user_id, start, end } = req.params;
    const uid = /^\d+$/.test(user_id) ? parseInt(user_id) : (await prisma.dc_users.findFirst({ where: { OR: [{ email: user_id }, { phone: user_id }], ut_id_fk: 4 }, select: { user_id: true } }))?.user_id;
    if (!uid) return res.json({ data: [], total: 0 });
    const data = await prisma.portal_spirometry.findMany({
      where: {
        observation: { user_id: uid },
        dbdate: { gte: new Date(start || '2020-01-01'), lte: new Date(end || '2030-01-01') },
      },
      orderBy: { dbdate: 'asc' },
      select: { dbdate: true, fev1: true, fvc: true, pefr: true, fef2575: true, fev1_perc: true, fev6: true },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIAQTrends = async (req, res) => {
  try {
    const { user_id, start, end } = req.params;
    const uid = /^\d+$/.test(user_id) ? parseInt(user_id) : (await prisma.dc_users.findFirst({ where: { OR: [{ email: user_id }, { phone: user_id }], ut_id_fk: 4 }, select: { user_id: true } }))?.user_id;
    if (!uid) return res.json({ data: [], total: 0 });
    const data = await prisma.portal_indoor_air_quality.findMany({
      where: { user_id: uid, dbdate: { gte: new Date(start), lte: new Date(end) } },
      orderBy: { dbdate: 'asc' },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAQITrends = async (req, res) => {
  try {
    const data = []; // Breezometer models not in DB yet
    res.json({ data, message: 'AQI trends endpoint ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPollenTrends = async (req, res) => {
  try {
    const data = [];
    res.json({ data, message: 'Pollen trends endpoint ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAlertsTrends = async (req, res) => {
  try {
    const { user_id } = req.params;
    const uid = /^\d+$/.test(user_id) ? parseInt(user_id) : (await prisma.dc_users.findFirst({ where: { OR: [{ email: user_id }, { phone: user_id }], ut_id_fk: 4 }, select: { user_id: true } }))?.user_id;
    if (!uid) return res.json([]);
    const data = await prisma.portal_alert.findMany({
      where: { user_id: uid },
      orderBy: { created: 'desc' },
      take: 50,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSurveyTrends = async (req, res) => {
  try {
    const data = [];
    res.json({ data, message: 'Survey trends endpoint ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════════════
// 🚨 ALERTS & NOTIFICATIONS
// ═══════════════════════════════

const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_read, start_date, end_date, user_id } = req.query;
    
    const where = {};
    
    // Search by message or user name
    if (search) {
      where.OR = [
        { message: { contains: search } },
        { user: { f_name: { contains: search } } },
        { user: { l_name: { contains: search } } },
      ];
    }
    
    // Filter by read status
    if (is_read !== undefined) {
      where.is_read = is_read === 'true';
    }
    
    // Date range filter
    if (start_date || end_date) {
      where.created = {};
      if (start_date) where.created.gte = new Date(start_date);
      if (end_date) where.created.lte = new Date(end_date + 'T23:59:59.999Z');
    }
    
    // Filter by user
    if (user_id) {
      where.user_id = parseInt(user_id);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      prisma.portal_alert.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created: 'desc' },
        include: {
          user: { select: { user_id: true, f_name: true, l_name: true, email: true } },
        },
      }),
      prisma.portal_alert.count({ where }),
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
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

const createAlert = async (req, res) => {
  try {
    const { user_id, message } = req.body;
    const alert = await prisma.portal_alert.create({
      data: { user_id, message },
    });
    res.status(201).json({ message: 'Alert created', data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { user_id } = req.params;
    const uid = /^\d+$/.test(user_id) ? parseInt(user_id) : (await prisma.dc_users.findFirst({ where: { OR: [{ email: user_id }, { phone: user_id }], ut_id_fk: 4 }, select: { user_id: true } }))?.user_id;
    if (!uid) return res.json([]);
    const { title, body } = req.body;

    // Get user's FCM tokens
    const tokens = await prisma.dc_fcm_token.findMany({
      where: { user_id_fk: parseInt(user_id), is_enabled: true },
    });

    // Create alert
    const alert = await prisma.portal_alert.create({
      data: {
        user_id: parseInt(user_id),
        message: `${title}: ${body}`,
      },
    });

    // Create notification record
    await prisma.portal_alert_notification.create({
      data: {
        alert_id: alert.id,
        channel: 'push',
      },
    });

    res.json({
      message: 'Notification sent',
      data: { alert_id: alert.id, tokens_count: tokens.length },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════════════
// 🔮 PREDICTED VALUES
// ═══════════════════════════════

const getPredictedValues = async (req, res) => {
  try {
    const { user_id } = req.params;
    const uid = /^\d+$/.test(user_id) ? parseInt(user_id) : (await prisma.dc_users.findFirst({ where: { OR: [{ email: user_id }, { phone: user_id }], ut_id_fk: 4 }, select: { user_id: true } }))?.user_id;
    if (!uid) return res.json([]);
    const data = await prisma.portal_predicted_value.findMany({
      where: { user_id: uid },
      orderBy: { created: 'desc' },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPredictedValues = async (req, res) => {
  try {
    const { user_id, variables } = req.body;
    const created = [];
    for (const v of variables) {
      const pv = await prisma.portal_predicted_value.create({
        data: {
          user_id: parseInt(user_id),
          variable: v.variable,
          predicted: v.predicted,
          lln: v.lln,
          uln: v.uln,
          z_score: v.zScore,
          percent_predicted: v.percentPredicted,
        },
      });
      created.push(pv);
    }
    res.status(201).json({ message: 'Predicted values saved', data: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSpirometryTrends, getIAQTrends, getAQITrends, getPollenTrends, getAlertsTrends, getSurveyTrends,
  getAlerts, createAlert, sendNotification,
  getPredictedValues, createPredictedValues,
};
