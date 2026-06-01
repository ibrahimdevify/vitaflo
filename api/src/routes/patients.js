const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/patients/groups:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patient groups
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Patient groups list
 *   post:
 *     tags: [Patients]
 *     summary: Create patient group
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               account_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group created
 */
router.get('/groups', patientController.getPatientGroups);
router.post('/groups', authorize('technician', 'account_admin'), patientController.createPatientGroup);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients with filters and pagination
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patients list
 */
router.get('/', patientController.getAllPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient full detail with medical records
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
 *         description: Patient detail
 */
router.get('/:id', patientController.getPatientById);

/**
 * @swagger
 * /api/patients/{id}/attributes:
 *   post:
 *     tags: [Patients]
 *     summary: Create medical attributes for patient
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient Detail ID (pd_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               gender:
 *                 type: string
 *               smoking:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Attributes created
 *   put:
 *     tags: [Patients]
 *     summary: Update medical attributes
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
 *         description: Attributes updated
 */
router.post('/:id/attributes', authorize('technician', 'account_admin', 'clinician'), patientController.createAttributes);
router.put('/:id/attributes', authorize('technician', 'account_admin', 'clinician'), patientController.updateAttributes);

/**
 * @swagger
 * /api/patients/{id}/prescriptions:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient prescriptions
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
 *         description: Prescriptions list
 *   post:
 *     tags: [Patients]
 *     summary: Create prescription
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
 *               diagnosis:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Prescription created
 */
router.get('/:id/prescriptions', patientController.getPrescriptions);
router.post('/:id/prescriptions', authorize('technician', 'account_admin', 'clinician'), patientController.createPrescription);

module.exports = router;
