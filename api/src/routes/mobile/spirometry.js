const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/mobile/spirometryController');
const { authenticate } = require('../../middleware/auth');

// Spirometry
router.post('/user_observations/sync', authenticate, ctrl.syncSpirometry);
router.post('/user_observations/sync_plus', authenticate, ctrl.syncSpirometryPlus);
router.get('/spirometry/user/:user_id', authenticate, ctrl.getSpirometryByUser);

// Predicted
router.get('/predicted/:user_id', authenticate, ctrl.getPredictedValues);

// Alerts
router.post('/compute/alert/:user_id', authenticate, ctrl.computeAlerts);

// Surveys
router.post('/user_observations/pre-spiro', authenticate, ctrl.submitPreSpiroSurvey);
router.get('/user_observations/pre-spiro', ctrl.getPreSpiroSurvey);
router.post('/take_survey', authenticate, ctrl.takeSurvey);

// Results & Reports
router.get('/results/:patient_id/:start_date/:end_date', authenticate, ctrl.getResults);
router.get('/days_of_spirometry/:patient_id', authenticate, ctrl.getDaysOfSpirometry);

// Sync
router.post('/user', authenticate, ctrl.syncPatient);

// Legacy
router.get('/logins/login', authenticate, (req, res) => {
  res.json({ user: { id: req.user.user_id } });
});

module.exports = router;
