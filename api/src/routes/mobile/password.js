const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/mobile/passwordController');

router.post('/password_reset/forgot_username_password/', ctrl.forgotPassword);
router.post('/password_reset/confirm/', ctrl.confirmReset);

module.exports = router;
