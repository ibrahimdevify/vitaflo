const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/system:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get system-wide stats (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get('/system', authorize('technician', 'account_admin'), dashboardController.getSystemStats);

/**
 * @swagger
 * /api/dashboard/clinician:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get clinician personal dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Clinician dashboard data
 */
router.get('/clinician', dashboardController.getClinicianDashboard);

/**
 * @swagger
 * /api/dashboard/patient/{id}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get patient stats and history
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
 *         description: Patient statistics
 */
router.get('/patient/:id', dashboardController.getPatientStats);

module.exports = router;
