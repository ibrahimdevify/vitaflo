const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users with pagination
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: ut_id_fk
 *         schema:
 *           type: integer
 *         description: User type (1=tech, 2=admin, 3=clinician, 4=patient)
 *     responses:
 *       200:
 *         description: Users list
 */
router.get('/', userController.getAllUsers);
router.get('/types', userController.getUserTypes);
router.get('/statuses', userController.getUserStatuses);
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', authorize('technician', 'account_admin', 'clinician'), userController.createUser);
router.put('/:id', authorize('technician', 'account_admin'), userController.updateUser);
router.delete('/:id', authorize('technician', 'account_admin'), userController.deleteUser);

module.exports = router;
