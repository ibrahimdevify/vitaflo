const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/portalController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Spirometry
router.get('/spirometry/user/:user_id', ctrl.getSpirometryByUser);
router.get('/spirometry/latest', ctrl.getSpirometryLatest);
router.get('/spirometry/all', ctrl.getSpirometryAll);
router.get('/spirometry/max', ctrl.getSpirometryAll); // Same as all for now
router.post('/user_observations/sync_plus', ctrl.syncSpirometry);
router.post('/user_observations/sync', ctrl.syncSpirometry);

// Observations
router.get('/user_observations', ctrl.getObservations);

// Heart Rate
router.get('/heart_rate_observations', ctrl.getHeartRate);
router.post('/heart_rate_observations/sync', ctrl.syncHeartRate);

// Steps
router.get('/steps_observations', ctrl.getSteps);
router.post('/steps_observations/sync', ctrl.syncSteps);

// Notes
router.get('/notes', ctrl.getNotes);
router.post('/notes', ctrl.createNote);

// Air Quality
router.get('/airquality/airquality', ctrl.getAirQuality);

// Dashboard
router.get('/days_of_spirometry/:user', ctrl.getDaysOfSpirometry);
router.get('/spirometry_readings', ctrl.getSpirometryReadings);

module.exports = router;
