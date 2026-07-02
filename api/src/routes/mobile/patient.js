const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/mobile/patientController');
const spiroCtrl = require('../../controllers/mobile/spirometryController');
const { authenticate } = require('../../middleware/auth');

// Public routes (no auth required)
router.post('/patient/login', ctrl.patientLogin);
router.post('/clinician/login', ctrl.clinicianLogin);
router.post('/patient/verify', ctrl.verifyPatient);
router.post('/patient/patient_exists', ctrl.patientExists);

// Protected routes
router.post('/patient/me', authenticate, ctrl.getMe);
router.post('/clinician/me', authenticate, ctrl.getMe);
router.patch('/patient/:user_id', authenticate, ctrl.updateCredentials);
router.patch('/patient/:user_id/attributes', authenticate, ctrl.updateDemographics);
router.patch('/patient/:user_id/awair', authenticate, ctrl.addAwairToken);
router.patch('/patient/:user_id/onboarding', authenticate, ctrl.saveOnboarding);

// Patient management
router.get('/patient', authenticate, ctrl.getClinicianPatients);
router.get('/patient/:patient_id', authenticate, ctrl.getPatientById);
router.post('/patient', authenticate, ctrl.createPatient);
router.post('/patient/:patient_id/clinician_control', authenticate, ctrl.clinicianControl);

// Clinician
router.get('/clinician/:clinician_id', authenticate, ctrl.getClinicianById);

module.exports = router;
