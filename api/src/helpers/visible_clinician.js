const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getVisibleClinicianIds = async (user) => {
  // System admin → every clinician in the system
  if (user.ut_id_fk === 2) {
    const allClinicians = await prisma.dc_users.findMany({
      where: {
        ut_id_fk: 3,   // 👈 CHANGE THIS to your real clinician type
        us_id_fk: 1,
      },
      select: { user_id: true },
    });
    return allClinicians.map((c) => c.user_id);
  }

  if (user.ut_id_fk === 3) {
    return [user.user_id];
  }

  if (user.ut_id_fk === 6) {
    const managed = await prisma.dc_clinician_assignments.findMany({
      where: { clinician_admin_id: user.user_id },
      select: { clinician_id: true },
    });
    return [user.user_id, ...managed.map((m) => m.clinician_id)];
  }

  return [];
};

module.exports = { getVisibleClinicianIds };