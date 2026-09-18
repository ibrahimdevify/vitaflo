const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVisibleClinicianIds = async (user) => {
  // Plain clinician: can only see their own patients.
  if (user.ut_id_fk === 3) {
    return [user.user_id];
  }

  // Clinician admin: can see their own patients (if any are
  // directly assigned to them) plus every clinician they manage.
  if (user.ut_id_fk === 6) {
    const managed = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: user.user_id },
      select: { clinician_id: true },
    });

    const managedIds = managed.map((m) => m.clinician_id);
    return [user.user_id, ...managedIds];
  }

  return [];
};

module.exports = { getVisibleClinicianIds };