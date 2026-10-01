const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Returns the list of clinician user_ids whose patients the caller is
 * allowed to see.
 *
 * Role mapping (from req.user.ut_id_fk):
 *   2 → system admin       → ALL clinicians in the system
 *   3 → plain clinician    → only themselves
 *   6 → clinician admin    → themselves + every clinician they manage
 *   * → anything else      → [] (no access)
 */
const getVisibleClinicianIds = async (user) => {
  // ────────────────────────────────────────────────────────────
  // System admin: sees every clinician → effectively every patient.
  // ────────────────────────────────────────────────────────────
  if (user.ut_id_fk === 2) {
    const allClinicians = await prisma.dc_users.findMany({
      // ⚠️ Adjust `ut_id_fk` here to whatever value identifies a
      // *clinician* in your schema. Using 4 here only makes sense if
      // your clinicians are stored as ut_id_fk = 4.
      where: {
        ut_id_fk: 4,
        us_id_fk: 1,
      },
      select: { user_id: true },
    });

    return allClinicians.map((c) => c.user_id);
  }

  // ────────────────────────────────────────────────────────────
  // Plain clinician: only their own patients.
  // ────────────────────────────────────────────────────────────
  if (user.ut_id_fk === 3) {
    return [user.user_id];
  }

  // ────────────────────────────────────────────────────────────
  // Clinician admin: themselves + every clinician they manage.
  // ────────────────────────────────────────────────────────────
  if (user.ut_id_fk === 6) {
    const managed = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: user.user_id },
      select: { clinician_id: true },
    });

    const managedIds = managed.map((m) => m.clinician_id);
    return [user.user_id, ...managedIds];
  }

  // ────────────────────────────────────────────────────────────
  // Unknown / unsupported role → no visibility.
  // ────────────────────────────────────────────────────────────
  return [];
};

module.exports = { getVisibleClinicianIds };