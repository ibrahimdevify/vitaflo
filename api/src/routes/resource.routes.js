const express = require('express');
const {
  listResources,
  getResourcePdf,
} = require('../controllers/resource.controller');

const router = express.Router();

// Resource list
router.get('/resources', listResources);

// PDF — no Authorization middleware
router.get('/resources/:filename', getResourcePdf);

module.exports = router;