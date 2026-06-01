const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: Get all accounts (organizations)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts list
 *   post:
 *     tags: [Accounts]
 *     summary: Create new account
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 */
router.get('/', controller.getAllAccounts);
router.post('/', authorize('technician'), controller.createAccount);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get account detail
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
 *         description: Account detail
 */
router.get('/:id', controller.getAccountById);
router.get('/:id/attributes', controller.getAccountAttributes);
router.get('/:id/stats', controller.getAccountStats);
router.put('/:id', authorize('technician', 'account_admin'), controller.updateAccount);

module.exports = router;
