const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PATIENT_TYPE_ID = 4;

/** Builds a { gte, lte } dbdate/created filter only when both bounds are present. */
function buildOptionalDateFilter(field, startDate, endDate) {
  if (!startDate || !endDate) return {};
  return { [field]: { gte: startDate, lte: endDate } };
}

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

async function countObservations(userId, startDate, endDate) {
  return prisma.portal_observation.count({
    where: { user_id: userId, ...buildOptionalDateFilter('dbdate', startDate, endDate) },
  });
}

/**
 * Paginated observation list, newest first.
 * includeCurves controls whether flow/volume points are loaded per test —
 * keep it false for lightweight list views (Reports) and true where charts render (Spirometry).
 */
async function findObservationsPage(userId, { startDate, endDate, skip, take, includeCurves = false }) {
  return prisma.portal_observation.findMany({
    where: { user_id: userId, ...buildOptionalDateFilter('dbdate', startDate, endDate) },
    include: {
      spirometries: includeCurves ? { include: { flows: true, volumes: true } } : true,
    },
    orderBy: { dbdate: 'desc' },
    skip,
    take,
  });
}

async function findObservationsByIds(observationIds) {
  return prisma.portal_observation.findMany({
    where: { id: { in: observationIds } },
    include: { spirometries: { include: { flows: true, volumes: true } } },
  });
}

/** Unpaginated fetch used only by Billing, which groups readings by day in the service layer. */
async function findObservationsInRange(userId, startDate, endDate) {
  return prisma.portal_observation.findMany({
    where: { user_id: userId, ...buildOptionalDateFilter('dbdate', startDate, endDate) },
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

async function findIndoorAirQuality(userId, startDate, endDate) {
  return prisma.portal_indoor_air_quality.findMany({
    where: { user_id: userId, ...buildOptionalDateFilter('dbdate', startDate, endDate) },
    orderBy: { dbdate: 'asc' },
  });
}

async function countAlerts(userId, startDate, endDate) {
  return prisma.portal_alert.count({
    where: { user_id: userId, ...buildOptionalDateFilter('created', startDate, endDate) },
  });
}

async function findAlertsPage(userId, { startDate, endDate, skip, take }) {
  return prisma.portal_alert.findMany({
    where: { user_id: userId, ...buildOptionalDateFilter('created', startDate, endDate) },
    include: { notifications: true },
    orderBy: { created: 'desc' },
    skip,
    take,
  });
}

module.exports = {
  findPatientCore,
  findPatientsList,
  findPatientProfile,
  findActiveMedications,
  countObservations,
  findObservationsPage,
  findObservationsByIds,
  findObservationsInRange,
  findPredictedValues,
  findIndoorAirQuality,
  countAlerts,
  findAlertsPage,
};