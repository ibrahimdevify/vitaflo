const express = require('express');

const {
  listResources,
  getResourcePdf,
} = require('../controllers/resource.controller');

const router = express.Router();

// GET /api/resources
router.get('/resources/', listResources);

// GET /api/resources/:filename
router.get('/:filename', getResourcePdf);

module.exports = router;