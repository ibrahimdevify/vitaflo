const prisma = require('../lib/prismaClient');

const CACHE_TTL_MS = 30_000;
let moduleIdCache = null; // Map<lowercased module name, m_id>
let moduleIdCacheAt = 0;

async function getModuleIdByName(moduleName) {
  const now = Date.now();
  if (!moduleIdCache || now - moduleIdCacheAt > CACHE_TTL_MS) {
    const modules = await prisma.dc_modules.findMany();
    moduleIdCache = new Map(modules.map((m) => [m.m_name.toLowerCase(), m.m_id]));
    moduleIdCacheAt = now;
  }
  return moduleIdCache.get(moduleName.toLowerCase());
}

/**
 * Express middleware factory — gates a route behind dc_module_roles.
 *
 *   router.get('/patients', requirePermission('Patients', 'view'), patientController.getAllPatients);
 *   router.post('/patients', requirePermission('Patients', 'write'), patientController.createPatient);
 *
 * Requires `req.user.ut_id_fk` to already be set by your existing auth middleware.
 * `moduleName` must match a row's `m_name` in dc_modules (case-insensitive) — create
 * that module first via POST /modules if it doesn't exist yet, or this 500s with a
 * clear log line rather than silently allowing/denying everyone.
 *
 * Module-name → id lookups are cached for 30s per process, so creating/renaming a
 * module can take up to that long to be picked up by already-running instances.
 */
function requirePermission(moduleName, action = 'view') {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.ut_id_fk) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Admins bypass module restrictions entirely — no dc_module_roles lookup needed.
      if (req.user.ut_id_fk === 2) {
        return next();
      }

      const moduleId = await getModuleIdByName(moduleName);
      if (!moduleId) {
        console.error(`requirePermission: unknown module "${moduleName}" — check dc_modules`);
        return res.status(500).json({ error: 'Server misconfiguration' });
      }

      const permission = await prisma.dc_module_roles.findFirst({
        where: { ut_id_fk: req.user.ut_id_fk, m_id_fk: moduleId },
      });

      const allowed = action === 'write' ? Boolean(permission?.is_writeable) : Boolean(permission?.is_view);
      if (!allowed) {
        return res.status(403).json({ error: `You don't have ${action} access to ${moduleName}` });
      }

      next();
    } catch (error) {
      console.error('requirePermission error:', error);
      res.status(500).json({ error: 'Failed to verify permissions' });
    }
  };
}

module.exports = { requirePermission };