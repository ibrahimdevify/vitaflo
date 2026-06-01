const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/notifications/tokens:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all FCM tokens
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tokens list
 *   post:
 *     tags: [Notifications]
 *     summary: Register FCM token for push notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *               device:
 *                 type: string
 *     responses:
 *       201:
 *         description: Token registered
 */
router.get('/tokens', controller.getTokens);
router.post('/tokens', controller.registerToken);

/**
 * @swagger
 * /api/notifications/tokens/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Disable FCM token
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Token disabled
 */
router.delete('/tokens/:id', controller.unregisterToken);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Send notification to specific user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationSend'
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post('/send', authorize('technician', 'account_admin'), controller.sendNotification);

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     tags: [Notifications]
 *     summary: Broadcast notification to all users or by type
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               ut_id_fk:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcast', authorize('technician', 'account_admin'), controller.broadcastNotification);

module.exports = router;
