// Route path -> dc_modules.name mapping. Must match a module's `name` in the
// Modules tab (Roles page) exactly (case-insensitive) or that route/nav item
// will show as denied for every non-admin role until you create/rename the
// module to match. Paths with no entry here (e.g. "/", "/profile") are
// always visible/accessible — they aren't gated by a module.
export const ROUTE_MODULES = {
  '/users': 'Users',
  '/patients': 'Patients',
  '/clinicians': 'Clinicians',
  '/spirometry': 'Spirometry',
  '/trends': 'Trends',
  '/alerts': 'Alerts',
  '/predicted': 'Predicted',
  '/devices': 'Devices',
  '/accounts': 'Accounts',
  '/roles': 'Roles',
};

/**
 * True if `user` can view `moduleName`.
 *
 * Admins (ut_id_fk === 2) bypass the module-permission check entirely — see
 * requirePermission.js on the backend for the same rule.
 *
 * `modules` is the array the /login response now returns (see
 * authController.js's updated login handler): each entry looks like
 * { moduleId, moduleName, isView, isWriteable }.
 */
export function hasViewAccess(user, modules, moduleName) {
  if (user?.ut_id_fk === 2) return true;
  if (!Array.isArray(modules)) return false;
  const entry = modules.find(
    (m) => m.moduleName?.toLowerCase() === moduleName.toLowerCase()
  );
  return Boolean(entry?.isView);
}