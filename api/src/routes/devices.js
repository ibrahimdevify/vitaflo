const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     tags: [Devices]
 *     summary: Get all devices
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Devices list
 *   post:
 *     tags: [Devices]
 *     summary: Register new device
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceCreate'
 *     responses:
 *       201:
 *         description: Device created
 */
router.get('/', deviceController.getAllDevices);
router.post('/', authorize('technician', 'account_admin', 'clinician'), deviceController.createDevice);

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     tags: [Devices]
 *     summary: Get device detail
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
 *         description: Device detail
 */
router.get('/:id', deviceController.getDeviceById);

/**
 * @swagger
 * /api/devices/{id}/readings:
 *   get:
 *     tags: [Devices]
 *     summary: Get device air quality readings
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
 *         description: Device readings
 */
router.get('/:id/readings', deviceController.getDeviceReadings);
router.put('/:id', authorize('technician', 'account_admin'), deviceController.updateDevice);

/**
 * @swagger
 * /api/devices/{id}/assign:
 *   post:
 *     tags: [Devices]
 *     summary: Assign device to patient
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Device assigned
 */
router.post('/:id/assign', authorize('technician', 'account_admin', 'clinician'), deviceController.assignDevice);

module.exports = router;
