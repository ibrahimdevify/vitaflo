const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PATIENT_TYPE_ID = 4;

/** Minimal existence check used by the controller before running any tab query. */
async function findPatientCore(userId) {
  return prisma.dc_users.findFirst({
    where: { user_id: userId, ut_id_fk: PATIENT_TYPE_ID },
    select: { user_id: true },
  });
}

async function findPatientsList() {
  return prisma.dc_users.findMany({
    where: { ut_id_fk: PATIENT_TYPE_ID },
    select: { user_id: true, f_name: true, l_name: true },
    orderBy: [{ l_name: 'asc' }, { f_name: 'asc' }],
  });
}

async function findPatientProfile(userId) {
  return prisma.dc_users.findFirst({
    where: { user_id: userId, ut_id_fk: PATIENT_TYPE_ID },
    select: {
      user_id: true,
      f_name: true,
      l_name: true,
      email: true,
      phone: true,
      userName: true,
      user_status: { select: { name: true } },
      patient_details: {
        select: {
          height: true,
          weight: true,
          attributes: {
            select: {
              phone: true,
              dob: true,
              height: true,
              weight: true,
              gender: true,
              ethnic_group: true,
              smoking: true,
              start_date: true,
              addresses: {
                select: { street: true, city: true, state: true, zip: true },
              },
            },
          },
        },
      },
    },
  });
}

async function findActiveMedications(userId) {
  return prisma.dc_ehr_prescriptions.findMany({
    where: { patient_id_fk: userId, is_deleted: false },
    include: { medicines: { where: { is_deleted: false } } },
    orderBy: { pr_date: 'desc' },
  });
}

async function findObservationsByDate(userId, startOfDay, endOfDay) {
  return prisma.portal_observation.findMany({
    where: { user_id: userId, dbdate: { gte: startOfDay, lte: endOfDay } },
    include: { spirometries: { include: { flows: true, volumes: true } } },
    orderBy: { dbdate: 'asc' },
  });
}

async function findObservationsByIds(observationIds) {
  return prisma.portal_observation.findMany({
    where: { id: { in: observationIds } },
    include: { spirometries: { include: { flows: true, volumes: true } } },
  });
}

async function findObservationsInRange(userId, startDate, endDate) {
  return prisma.portal_observation.findMany({
    where: { user_id: userId, dbdate: { gte: startDate, lte: endDate } },
    include: { spirometries: true },
    orderBy: { dbdate: 'asc' },
  });
}

async function findPredictedValues(userId, variables) {
  return prisma.portal_predicted_value.findMany({
    where: { user_id: userId, variable: { in: variables } },
    orderBy: { created: 'desc' },
  });
}

async function findSpirometryTrends(userId, startDate, endDate) {
  return prisma.portal_spirometry_trends.findMany({
    where: { user_id: userId, dbdate: { gte: startDate, lte: endDate } },
    orderBy: { dbdate: 'asc' },
  });
}

async function findIndoorAirQuality(userId, startDate, endDate) {
  return prisma.portal_indoor_air_quality.findMany({
    where: { user_id: userId, dbdate: { gte: startDate, lte: endDate } },
    orderBy: { dbdate: 'asc' },
  });
}

async function findAlertHistory(userId) {
  return prisma.portal_alert.findMany({
    where: { user_id: userId },
    include: { notifications: true },
    orderBy: { created: 'desc' },
  });
}

module.exports = {
  findPatientCore,
  findPatientsList,
  findPatientProfile,
  findActiveMedications,
  findObservationsByDate,
  findObservationsByIds,
  findObservationsInRange,
  findPredictedValues,
  findSpirometryTrends,
  findIndoorAirQuality,
  findAlertHistory,
};