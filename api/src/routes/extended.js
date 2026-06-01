const express = require('express');
const router = express.Router();
const patientExt = require('../controllers/patientExtendedController');
const adminCtrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/patients/exists:
 *   get:
 *     tags: [Patients]
 *     summary: Check if patient exists by email/phone/chart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *       - in: query
 *         name: chart_no
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Existence check result
 */
router.get('/patients/exists', authenticate, patientExt.patientExists);

/**
 * @swagger
 * /api/patients/verify:
 *   post:
 *     tags: [Patients]
 *     summary: Verify patient by chart number and phone
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chart_no:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification result
 */
router.post('/patients/verify', authenticate, patientExt.verifyPatient);

/**
 * @swagger
 * /api/patients/daily-reminder:
 *   get:
 *     tags: [Patients]
 *     summary: Get patients for daily reminder
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients needing reminders
 */
router.get('/patients/daily-reminder', authenticate, authorize('technician', 'account_admin', 'clinician'), patientExt.getDailyReminderPatients);

/**
 * @swagger
 * /api/patients/clinician-control:
 *   post:
 *     tags: [Patients]
 *     summary: Clinician control over patient (enable/disable RPM, web access)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *               action:
 *                 type: string
 *                 enum: [enable_rpm, disable_rpm, enable_web, disable_web, activate, deactivate]
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.post('/patients/clinician-control', authenticate, authorize('clinician'), patientExt.clinicianControl);

/**
 * @swagger
 * /api/patients/air-data/awair:
 *   get:
 *     tags: [Patients]
 *     summary: Get air quality data from Awair device
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Air quality readings
 */
router.get('/patients/air-data/awair', authenticate, patientExt.getAirDataAwair);

/**
 * @swagger
 * /api/patients/air-data/breezometer:
 *   get:
 *     tags: [Patients]
 *     summary: Get air quality data from Breezometer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Air quality readings
 */
router.get('/patients/air-data/breezometer', authenticate, patientExt.getAirDataBreezometer);

/**
 * @swagger
 * /api/clinicians/reset-password:
 *   post:
 *     tags: [Clinicians]
 *     summary: Admin reset clinician password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clinician_id:
 *                 type: integer
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset
 */
router.post('/clinicians/reset-password', authenticate, authorize('technician', 'account_admin'), adminCtrl.adminResetClinicianPassword);

/**
 * @swagger
 * /api/attributes/list:
 *   get:
 *     tags: [Patients]
 *     summary: Get attributes list by name filter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attributes list
 */
router.get('/attributes/list', authenticate, adminCtrl.getAttributesList);

/**
 * @swagger
 * /api/version:
 *   get:
 *     tags: [Auth]
 *     summary: Get API version info
 *     responses:
 *       200:
 *         description: Version information
 */
router.get('/version', adminCtrl.getVersion);

module.exports = router;
