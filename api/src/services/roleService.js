const prisma = require('../lib/prismaClient');

class ValidationError extends Error {}
class ConflictError extends Error {}

// Baked into existing app logic by numeric id — e.g. patientRepository.js's
// PATIENT_TYPE_ID = 4, and `req.user.ut_id_fk === 3` clinician checks elsewhere.
// Renaming these is fine; deleting them would silently break those checks.
const PROTECTED_ROLE_IDS = [1, 2, 3, 4];

// ══════════════════════════════════════
// Roles (dc_user_type)
// ══════════════════════════════════════

async function listRoles() {
  const roles = await prisma.dc_user_type.findMany({
    orderBy: { ut_id: 'asc' },
    include: { _count: { select: { users: true } } },
  });
  return roles.map((r) => ({ id: r.ut_id, name: r.name, userCount: r._count.users }));
}

async function getRole(roleId) {
  const role = await prisma.dc_user_type.findUnique({
    where: { ut_id: roleId },
    include: { _count: { select: { users: true } } },
  });
  if (!role) return null;
  return { id: role.ut_id, name: role.name, userCount: role._count.users };
}

async function createRole(name) {
  if (!name || !name.trim()) throw new ValidationError('name is required');
  const role = await prisma.dc_user_type.create({ data: { name: name.trim() } });
  return { id: role.ut_id, name: role.name };
}

async function updateRole(roleId, name) {
  if (!name || !name.trim()) throw new ValidationError('name is required');
  const existing = await prisma.dc_user_type.findUnique({ where: { ut_id: roleId } });
  if (!existing) return null;
  const role = await prisma.dc_user_type.update({ where: { ut_id: roleId }, data: { name: name.trim() } });
  return { id: role.ut_id, name: role.name };
}

async function deleteRole(roleId) {
  const existing = await prisma.dc_user_type.findUnique({
    where: { ut_id: roleId },
    include: { _count: { select: { users: true } } },
  });
  if (!existing) return null;

  if (PROTECTED_ROLE_IDS.includes(roleId)) {
    throw new ConflictError('This role is referenced by numeric id elsewhere in the app and cannot be deleted');
  }
  if (existing._count.users > 0) {
    throw new ConflictError(`Cannot delete role: ${existing._count.users} user(s) are still assigned to it`);
  }

  await prisma.$transaction([
    prisma.dc_module_roles.deleteMany({ where: { ut_id_fk: roleId } }),
    prisma.dc_user_type.delete({ where: { ut_id: roleId } }),
  ]);
  return true;
}

// ══════════════════════════════════════
// Modules (dc_modules)
// ══════════════════════════════════════

async function listModules() {
  const modules = await prisma.dc_modules.findMany({ orderBy: { m_id: 'asc' } });
  return modules.map((m) => ({ id: m.m_id, name: m.m_name }));
}

async function createModule(name) {
  if (!name || !name.trim()) throw new ValidationError('name is required');
  const module_ = await prisma.dc_modules.create({ data: { m_name: name.trim() } });
  return { id: module_.m_id, name: module_.m_name };
}

async function updateModule(moduleId, name) {
  if (!name || !name.trim()) throw new ValidationError('name is required');
  const existing = await prisma.dc_modules.findUnique({ where: { m_id: moduleId } });
  if (!existing) return null;
  const module_ = await prisma.dc_modules.update({ where: { m_id: moduleId }, data: { m_name: name.trim() } });
  return { id: module_.m_id, name: module_.m_name };
}

async function deleteModule(moduleId) {
  const existing = await prisma.dc_modules.findUnique({ where: { m_id: moduleId } });
  if (!existing) return null;
  await prisma.$transaction([
    prisma.dc_module_roles.deleteMany({ where: { m_id_fk: moduleId } }),
    prisma.dc_modules.delete({ where: { m_id: moduleId } }),
  ]);
  return true;
}

// ══════════════════════════════════════
// Permissions (dc_module_roles) — the role × module view/write matrix
// ══════════════════════════════════════

async function getRolePermissions(roleId) {
  const role = await prisma.dc_user_type.findUnique({ where: { ut_id: roleId } });
  if (!role) return null;

  const [modules, existingPermissions] = await Promise.all([
    prisma.dc_modules.findMany({ orderBy: { m_id: 'asc' } }),
    prisma.dc_module_roles.findMany({ where: { ut_id_fk: roleId } }),
  ]);

  const byModuleId = new Map(existingPermissions.map((p) => [p.m_id_fk, p]));

  return modules.map((m) => {
    const perm = byModuleId.get(m.m_id);
    return {
      moduleId: m.m_id,
      moduleName: m.m_name,
      isView: perm?.is_view ?? false,
      isWriteable: perm?.is_writeable ?? false,
    };
  });
}

/**
 * Bulk-save permissions for one role.
 * @param {number} roleId
 * @param {Array<{moduleId:number, isView:boolean, isWriteable:boolean}>} permissions
 */
async function setRolePermissions(roleId, permissions) {
  const role = await prisma.dc_user_type.findUnique({ where: { ut_id: roleId } });
  if (!role) return null;

  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new ValidationError('permissions must be a non-empty array');
  }

  const moduleIds = permissions.map((p) => p.moduleId);
  const validModules = await prisma.dc_modules.findMany({ where: { m_id: { in: moduleIds } } });
  const validModuleIds = new Set(validModules.map((m) => m.m_id));

  for (const p of permissions) {
    if (!validModuleIds.has(p.moduleId)) {
      throw new ValidationError(`Unknown moduleId: ${p.moduleId}`);
    }
  }

  // No @@unique([ut_id_fk, m_id_fk]) on dc_module_roles in the current schema, so
  // Prisma's upsert (which requires a unique `where`) isn't available here. Find-then-
  // write instead, wrapped in a transaction so the bulk save is all-or-nothing.
  await prisma.$transaction(async (tx) => {
    for (const p of permissions) {
      const existing = await tx.dc_module_roles.findFirst({
        where: { ut_id_fk: roleId, m_id_fk: p.moduleId },
      });
      const data = { is_view: Boolean(p.isView), is_writeable: Boolean(p.isWriteable) };

      if (existing) {
        await tx.dc_module_roles.update({ where: { mr_id: existing.mr_id }, data });
      } else {
        await tx.dc_module_roles.create({ data: { ut_id_fk: roleId, m_id_fk: p.moduleId, ...data } });
      }
    }
  });

  return getRolePermissions(roleId);
}

/** Full role × module grid — one call to build an admin permissions table. */
async function getPermissionsMatrix() {
  const [roles, modules, permissions] = await Promise.all([
    prisma.dc_user_type.findMany({ orderBy: { ut_id: 'asc' } }),
    prisma.dc_modules.findMany({ orderBy: { m_id: 'asc' } }),
    prisma.dc_module_roles.findMany(),
  ]);

  const key = (roleId, moduleId) => `${roleId}:${moduleId}`;
  const byKey = new Map(permissions.map((p) => [key(p.ut_id_fk, p.m_id_fk), p]));

  return {
    roles: roles.map((r) => ({ id: r.ut_id, name: r.name })),
    modules: modules.map((m) => ({ id: m.m_id, name: m.m_name })),
    matrix: roles.map((r) => ({
      roleId: r.ut_id,
      roleName: r.name,
      permissions: modules.map((m) => {
        const p = byKey.get(key(r.ut_id, m.m_id));
        return {
          moduleId: m.m_id,
          moduleName: m.m_name,
          isView: p?.is_view ?? false,
          isWriteable: p?.is_writeable ?? false,
        };
      }),
    })),
  };
}

/** Single-cell update — convenient for a UI toggle without resending the whole role's permissions. */
async function setPermissionCell(roleId, moduleId, { isView, isWriteable }) {
  const [role, module_] = await Promise.all([
    prisma.dc_user_type.findUnique({ where: { ut_id: roleId } }),
    prisma.dc_modules.findUnique({ where: { m_id: moduleId } }),
  ]);
  if (!role) throw new ValidationError(`Unknown roleId: ${roleId}`);
  if (!module_) throw new ValidationError(`Unknown moduleId: ${moduleId}`);

  const existing = await prisma.dc_module_roles.findFirst({ where: { ut_id_fk: roleId, m_id_fk: moduleId } });
  const data = { is_view: Boolean(isView), is_writeable: Boolean(isWriteable) };

  const saved = existing
    ? await prisma.dc_module_roles.update({ where: { mr_id: existing.mr_id }, data })
    : await prisma.dc_module_roles.create({ data: { ut_id_fk: roleId, m_id_fk: moduleId, ...data } });

  return { roleId, moduleId, isView: saved.is_view, isWriteable: saved.is_writeable };
}

// ══════════════════════════════════════
// User ↔ role assignment (dc_users.ut_id_fk)
// ══════════════════════════════════════

async function getUserRole(userId) {
  const user = await prisma.dc_users.findUnique({
    where: { user_id: userId },
    select: { user_id: true, ut_id_fk: true, user_type: { select: { name: true } } },
  });
  if (!user) return null;
  return { userId: user.user_id, roleId: user.ut_id_fk, roleName: user.user_type?.name ?? null };
}

async function setUserRole(userId, roleId) {
  const [user, role] = await Promise.all([
    prisma.dc_users.findUnique({ where: { user_id: userId } }),
    prisma.dc_user_type.findUnique({ where: { ut_id: roleId } }),
  ]);
  if (!user) throw new ValidationError(`User ${userId} not found`);
  if (!role) throw new ValidationError(`Role ${roleId} not found`);

  const updated = await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: roleId } });
  return { userId: updated.user_id, roleId: updated.ut_id_fk, roleName: role.name };
}

module.exports = {
  ValidationError,
  ConflictError,
  PROTECTED_ROLE_IDS,
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