const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ═══════════════════════════════
// 📈 TRENDS
// ═══════════════════════════════

const getSpirometryTrends = async (req, res) => {
  try {
    const { user_id, start, end } = req.params;

    // Resolve user ID (supports username, email, phone, or numeric)
    let uid;
    if (/^\d+$/.test(user_id)) {
      uid = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: {
          OR: [
            { userName: user_id },
            { email: user_id },
            { phone: user_id },
          ],
          ut_id_fk: 4
        },
        select: { user_id: true },
      });
      uid = user?.user_id;
    }

    if (!uid) return res.json({ data: [], total: 0 });

    // Get observations with spirometries
    const observations = await prisma.portal_observation.findMany({
      where: {
        user_id: uid,
        ...(start && end ? { dbdate: { gte: new Date(start), lte: new Date(end + 'T23:59:59Z') } } : {}),
      },
      include: { spirometries: true },
      orderBy: { dbdate: 'asc' },
    });

    // Flatten to get spirometry data with observation dates
    const data = observations.flatMap(obs =>
      obs.spirometries.map(sp => ({
        dbdate: obs.dbdate,
        fev1: sp.fev1,
        fvc: sp.fvc,
        pefr: sp.pefr,
        fef2575: sp.fef2575,
        fev6: sp.fev6,
        fev1_perc: sp.fev1_perc,
        is_post_bronchodilator: obs.is_post_bronchodilator,
        height: obs.height,
      }))
    );

    res.json({ data, total: data.length });
  } catch (error) {
    console.error('Get spirometry trends error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getIAQTrends = async (req, res) => {
  try {
    const { user_id, start, end } = req.params;

    let uid;
    if (/^\d+$/.test(user_id)) {
      uid = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: {
          OR: [
            { userName: user_id },
            { email: user_id },
            { phone: user_id },
          ],
          ut_id_fk: 4
        },
        select: { user_id: true },
      });
      uid = user?.user_id;
    }

    if (!uid) return res.json({ data: [], total: 0 });

    const data = await prisma.portal_indoor_air_quality.findMany({
      where: {
        user_id: uid,
        ...(start && end ? { dbdate: { gte: new Date(start), lte: new Date(end + 'T23:59:59Z') } } : {}),
      },
      orderBy: { dbdate: 'asc' },
    });

    res.json({ data, total: data.length });
  } catch (error) {
    console.error('Get IAQ trends error:', error);
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
    
    // Resolve user ID (supports username, email, phone, or numeric)
    let uid;
    if (/^\d+$/.test(user_id)) {
      uid = parseInt(user_id);
    } else {
      const user = await prisma.dc_users.findFirst({
        where: { 
          OR: [
            { userName: user_id },
            { email: user_id },
            { phone: user_id },
          ], 
          ut_id_fk: 4 
        },
        select: { user_id: true },
      });
      uid = user?.user_id;
    }
    
    if (!uid) return res.json({ data: [], total: 0 });
    
    const data = await prisma.portal_predicted_value.findMany({
      where: { user_id: uid },
      orderBy: { created: "desc" },
    });
    
    res.json({ data, total: data.length });
  } catch (error) {
    console.error("Get predicted values error:", error);
    res.status(500).json({ error: "Failed to fetch predicted values" });
  }
};

const createPredictedValues = async (req, res) => {
  try {
    const { user_id, variables } = req.body;
    
    // Resolve user ID (supports username, email, phone, or numeric)
    let uid;
    if (/^\d+$/.test(String(user_id))) {
      uid = parseInt(user_id);
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
      uid = user?.user_id;
    }
    
    if (!uid) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    const created = [];
    for (const v of variables) {
      const pv = await prisma.portal_predicted_value.create({
        data: {
          user_id: uid,
          variable: v.variable,
          predicted: v.predicted ? parseFloat(v.predicted) : null,
          lln: v.lln ? parseFloat(v.lln) : null,
          uln: v.uln ? parseFloat(v.uln) : null,
          z_score: v.zScore || v.z_score ? parseFloat(v.zScore || v.z_score) : null,
          percent_predicted: v.percentPredicted || v.percent_predicted ? parseFloat(v.percentPredicted || v.percent_predicted) : null,
        },
      });
      created.push(pv);
    }
    
    res.status(201).json({ message: "Predicted values saved", data: created });
  } catch (error) {
    console.error("Create predicted values error:", error);
    res.status(500).json({ error: "Failed to save predicted values", message: error.message });
  }
};

module.exports = {
  getSpirometryTrends, getIAQTrends, getAQITrends, getPollenTrends, getAlertsTrends, getSurveyTrends,
  getAlerts, createAlert, sendNotification,
  getPredictedValues, createPredictedValues,
};
