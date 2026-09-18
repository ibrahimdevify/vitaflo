const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVisibleClinicianIds = async (user) => {
  // Clinician admin: sees every clinician they manage.
  if (user.ut_id_fk === 6) {
    const managed = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: user.user_id },
      select: { clinician_id: true },
    });
    return managed.map((m) => m.clinician_id);
  }

  // Clinician: sees their whole team (every clinician sharing their
  // admin, including themselves) if they have an admin, otherwise
  // just their own assigned patients.
  if (user.ut_id_fk === 3) {
    const ownAssignment = await prisma.dc_clinician_assignments.findUnique({
      where: { clinician_id: user.user_id },
      select: { clinician_admin_id: true },
    });

    if (!ownAssignment) {
      return [user.user_id];
    }

    const teammates = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: ownAssignment.clinician_admin_id },
      select: { clinician_id: true },
    });
    return teammates.map((t) => t.clinician_id);
  }

  return [];
};

module.exports = { getVisibleClinicianIds };