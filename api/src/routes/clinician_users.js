const express = require('express');
const router = express.Router();

const clinicianUserController = require('../controllers/clinicianUserController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);


router.get('/', clinicianUserController.getAllClinicians);
router.post('/', clinicianUserController.createClinicianUser);
router.put('/:id', clinicianUserController.updateClinicianUser);



module.exports = router;
