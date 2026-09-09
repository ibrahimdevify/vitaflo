const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');


router.post('/login', authController.login);


router.post('/register', authController.register);


router.get('/me', authenticate, authController.me);


router.post('/logout', authenticate, authController.logout);


router.post('/refresh', authController.refresh);


router.post('/forgot-password', authController.forgotPassword);


router.post('/reset-password', authController.resetPassword);


router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
