const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Returns clinician user IDs visible to the authenticated user.
 * Roles: 2 = system admin, 3 = clinician, 6 = clinician admin.
 *
 * IMPORTANT: Patient visibility must still be enforced by the caller.
 * No inferred clinic/account-wide permissions are granted here.
 */
async function getVisibleClinicianIds(user) {
  const roleId = Number(user?.ut_id_fk);
  const userId = Number(user?.user_id);

  if (!Number.isSafeInteger(userId) || userId <= 0) return [];

  // Keep backward compatibility for any other callers of this helper.
  // The patient-list controller does NOT use this list for system admins;
  // admins must see unassigned patients too.
  if (roleId === 2) {
    const clinicians = await prisma.dc_users.findMany({
      where: { ut_id_fk: { in: [3, 6] } },
      select: { user_id: true },
    });
    return [...new Set(clinicians.map((c) => c.user_id))];
  }

  if (roleId === 3) return [userId];

  if (roleId === 6) {
    const links = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: userId },
      select: { clinician_id: true },
    });

    // Don't exclude managed clinicians merely because their user status changed;
    // patients they were responsible for might be historical research patients.
    return [...new Set([userId, ...links.map((link) => link.clinician_id)])];
  }

  return [];
}

module.exports = { getVisibleClinicianIds };