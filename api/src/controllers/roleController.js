const roleService = require('../services/roleService');
const { ValidationError, ConflictError } = roleService;

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function handleError(res, error) {
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
  console.error('Role management error:', error);
  return res.status(500).json({ error: 'Something went wrong' });
}

// ── Roles ──────────────────────────────────────────────

const listRoles = async (req, res) => {
  try {
    res.json({ data: await roleService.listRoles() });
  } catch (error) {
    handleError(res, error);
  }
};

const getRole = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.id, 'id');
    const role = await roleService.getRole(roleId);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ data: role });
  } catch (error) {
    handleError(res, error);
  }
};

const createRole = async (req, res) => {
  try {
    const role = await roleService.createRole(req.body.name);
    res.status(201).json({ data: role });
  } catch (error) {
    handleError(res, error);
  }
};

const updateRole = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.id, 'id');
    const role = await roleService.updateRole(roleId, req.body.name);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ data: role });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRole = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.id, 'id');
    const deleted = await roleService.deleteRole(roleId);
    if (!deleted) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

// ── Modules ────────────────────────────────────────────

const listModules = async (req, res) => {
  try {
    res.json({ data: await roleService.listModules() });
  } catch (error) {
    handleError(res, error);
  }
};

const createModule = async (req, res) => {
  try {
    const module_ = await roleService.createModule(req.body.name);
    res.status(201).json({ data: module_ });
  } catch (error) {
    handleError(res, error);
  }
};

const updateModule = async (req, res) => {
  try {
    const moduleId = parsePositiveInt(req.params.id, 'id');
    const module_ = await roleService.updateModule(moduleId, req.body.name);
    if (!module_) return res.status(404).json({ error: 'Module not found' });
    res.json({ data: module_ });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteModule = async (req, res) => {
  try {
    const moduleId = parsePositiveInt(req.params.id, 'id');
    const deleted = await roleService.deleteModule(moduleId);
    if (!deleted) return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

// ── Permissions ────────────────────────────────────────

const getRolePermissions = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.id, 'id');
    const permissions = await roleService.getRolePermissions(roleId);
    if (!permissions) return res.status(404).json({ error: 'Role not found' });
    res.json({ data: permissions });
  } catch (error) {
    handleError(res, error);
  }
};

const setRolePermissions = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.id, 'id');
    const updated = await roleService.setRolePermissions(roleId, req.body.permissions);
    if (!updated) return res.status(404).json({ error: 'Role not found' });
    res.json({ data: updated });
  } catch (error) {
    handleError(res, error);
  }
};

const getPermissionsMatrix = async (req, res) => {
  try {
    res.json({ data: await roleService.getPermissionsMatrix() });
  } catch (error) {
    handleError(res, error);
  }
};

const setPermissionCell = async (req, res) => {
  try {
    const roleId = parsePositiveInt(req.params.roleId, 'roleId');
    const moduleId = parsePositiveInt(req.params.moduleId, 'moduleId');
    const result = await roleService.setPermissionCell(roleId, moduleId, req.body);
    res.json({ data: result });
  } catch (error) {
    handleError(res, error);
  }
};

// ── User ↔ role assignment ─────────────────────────────

const getUserRole = async (req, res) => {
  try {
    const userId = parsePositiveInt(req.params.id, 'id');
    const result = await roleService.getUserRole(userId);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ data: result });
  } catch (error) {
    handleError(res, error);
  }
};

const setUserRole = async (req, res) => {
  try {
    const userId = parsePositiveInt(req.params.id, 'id');
    const roleId = parsePositiveInt(req.body.roleId, 'roleId');
    const result = await roleService.setUserRole(userId, roleId);
    res.json({ data: result });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listModules,
  createModule,
  updateModule,
  deleteModule,
  getRolePermissions,
  setRolePermissions,
  getPermissionsMatrix,
  setPermissionCell,
  getUserRole,
  setUserRole,
};