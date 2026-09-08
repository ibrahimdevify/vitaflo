const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Roles (dc_user_type)
router.get('/roles', roleController.listRoles);
router.get('/roles/:id', roleController.getRole);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

// Modules (dc_modules)
router.get('/modules', roleController.listModules);
router.post('/modules', roleController.createModule);
router.put('/modules/:id', roleController.updateModule);
router.delete('/modules/:id', roleController.deleteModule);

// Permissions (dc_module_roles) — the role × module view/write matrix
router.get('/roles/:id/permissions', roleController.getRolePermissions);
router.put('/roles/:id/permissions', roleController.setRolePermissions);
router.get('/permissions/matrix', roleController.getPermissionsMatrix);
router.put('/permissions/:roleId/:moduleId', roleController.setPermissionCell);

// User ↔ role assignment
router.get('/users/:id/role', roleController.getUserRole);
router.patch('/users/:id/role', roleController.setUserRole);

module.exports = router;