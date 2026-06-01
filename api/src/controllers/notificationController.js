const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTokens = async (req, res) => {
  try {
    const { user_id, is_enabled } = req.query;
    const where = {};
    if (user_id) where.user_id_fk = parseInt(user_id);
    if (is_enabled !== undefined) where.is_enabled = is_enabled === 'true';

    const tokens = await prisma.dc_fcm_token.findMany({
      where,
      include: { user: { select: { user_id: true, f_name: true, l_name: true, email: true } } },
      orderBy: { updated_date: 'desc' },
    });
    res.json({ data: tokens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
};

const registerToken = async (req, res) => {
  try {
    const { fcm_token, device = 'android' } = req.body;
    const userId = req.body.user_id || req.user.user_id;

    // Deactivate old tokens for same device
    await prisma.dc_fcm_token.updateMany({
      where: { user_id_fk: userId, device },
      data: { is_enabled: false },
    });

    // Create new token
    const token = await prisma.dc_fcm_token.create({
      data: { fcm_token, device, user_id_fk: userId },
    });

    res.status(201).json({ message: 'Token registered', data: token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register token' });
  }
};

const unregisterToken = async (req, res) => {
  try {
    await prisma.dc_fcm_token.update({
      where: { ft_id: parseInt(req.params.id) },
      data: { is_enabled: false },
    });
    res.json({ message: 'Token disabled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unregister token' });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { user_id, title, body, data } = req.body;

    // Get user's enabled tokens
    const tokens = await prisma.dc_fcm_token.findMany({
      where: { user_id_fk: parseInt(user_id), is_enabled: true },
    });

    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No active tokens found' });
    }

    // In production, send via Firebase Admin SDK
    // const admin = require('firebase-admin');
    // const message = { notification: { title, body }, data, tokens: tokens.map(t => t.fcm_token) };
    // await admin.messaging().sendEachForMulticast(message);

    // Mock response
    res.json({
      message: 'Notification sent',
      data: {
        sent_to: tokens.length,
        tokens: tokens.map(t => ({ id: t.ft_id, device: t.device, token: t.fcm_token.substring(0, 20) + '...' })),
        notification: { title, body },
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { title, body, ut_id_fk, data } = req.body;
    const where = { is_enabled: true };
    if (ut_id_fk) where.user = { ut_id_fk: parseInt(ut_id_fk) };

    const tokens = await prisma.dc_fcm_token.findMany({
      where,
      select: { fcm_token: true, device: true },
    });

    res.json({
      message: 'Broadcast sent',
      data: { recipients: tokens.length, notification: { title, body } },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast' });
  }
};

module.exports = { getTokens, registerToken, unregisterToken, sendNotification, broadcastNotification };
