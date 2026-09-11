const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getVisibleClinicianIds = async (user) => {
  if (
    (user.ut_id_fk === 3 || user.ut_id_fk === 6) &&
    user.us_id_fk === 1
  ) {
    return [user.user_id];
  }

  return [];
};

module.exports = { getVisibleClinicianIds };