const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/portalAdvancedController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Trends
router.get('/trends/spirometry/:user_id/:start/:end', ctrl.getSpirometryTrends);
router.get('/trends/iaq/:user_id/:start/:end', ctrl.getIAQTrends);
router.get('/trends/aqi/:user_id/:start/:end', ctrl.getAQITrends);
router.get('/trends/pollen/:user_id/:start/:end', ctrl.getPollenTrends);
router.get('/trends/alerts/:user_id', ctrl.getAlertsTrends);
router.get('/trends/survey/:user_id/:start/:end', ctrl.getSurveyTrends);

// Alerts
router.get('/alerts', ctrl.getAlerts);
router.post('/alerts', ctrl.createAlert);
router.post('/notify/:user_id', ctrl.sendNotification);

// Predicted
router.get('/predicted/:user_id', ctrl.getPredictedValues);
router.post('/predicted', ctrl.createPredictedValues);

module.exports = router;
