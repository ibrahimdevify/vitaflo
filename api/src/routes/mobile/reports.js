const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/mobile/reportController');
const { authenticate } = require('../../middleware/auth');

router.post('/reports', authenticate, ctrl.generateReport);
router.get('/reports/:task_id/status', authenticate, ctrl.getReportStatus);
router.get('/reports/:task_id/download', authenticate, ctrl.downloadReport);

module.exports = router;
