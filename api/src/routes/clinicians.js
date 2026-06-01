const express = require('express');
const router = express.Router();
const clinicianController = require('../controllers/clinicianController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/clinicians/overview:
 *   get:
 *     tags: [Clinicians]
 *     summary: Get logged-in clinician dashboard overview
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Clinician overview with stats
 */
router.get('/overview', clinicianController.getClinicianOverview);
router.get('/overview/:id', authorize('technician', 'account_admin'), clinicianController.getClinicianOverview);

/**
 * @swagger
 * /api/clinicians:
 *   get:
 *     tags: [Clinicians]
 *     summary: Get all clinicians
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Clinicians list
 */
router.get('/', clinicianController.getAllClinicians);

/**
 * @swagger
 * /api/clinicians/{id}:
 *   get:
 *     tags: [Clinicians]
 *     summary: Get clinician detail with patients
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
 *         description: Clinician detail
 */
router.get('/:id', clinicianController.getClinicianById);

/**
 * @swagger
 * /api/clinicians/{id}/patients:
 *   get:
 *     tags: [Clinicians]
 *     summary: Get clinician's assigned patients
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
 *         description: Patients list
 *   post:
 *     tags: [Clinicians]
 *     summary: Assign patient to clinician
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
 *       200:
 *         description: Patient assigned
 */
router.get('/:id/patients', clinicianController.getClinicianPatients);
router.post('/:id/patients', authorize('technician', 'account_admin', 'clinician'), clinicianController.assignPatient);
router.delete('/:id/patients/:patientId', authorize('technician', 'account_admin', 'clinician'), clinicianController.unassignPatient);

router.put('/:id/details', authorize('technician', 'account_admin', 'clinician'), clinicianController.updateDoctorDetails);

module.exports = router;
