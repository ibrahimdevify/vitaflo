const patientRepository = require('../../repositories/patientRepository');

class ValidationError extends Error {}

// Variables the schema can actually back with GLI predicted values / trend history.
// FET is intentionally excluded: no field for it anywhere in the schema.
const SPIROMETRY_VARIABLES = ['FEV1', 'FVC', 'FEV1/FVC', 'FEF2575', 'FEV6'];

const TREND_VARIABLE_FIELDS = {
  FEV1: 'fev1',
  FVC: 'fvc',
  PEFR: 'pefr',
  FEF2575: 'fef2575',
  'FEV1/FVC': 'fev1_perc',
};

function calculateAge(dobValue) {
  if (!dobValue) return null;
  const birthDate = new Date(dobValue);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function buildPredictedMap(predictedValues) {
  const map = new Map();
  for (const value of predictedValues) {
    if (!map.has(value.variable)) {
      map.set(value.variable, value);
    }
  }
  return map;
}

function buildVariableRow(label, observedValue, predictedMap) {
  const predicted = predictedMap.get(label) || null;
  return {
    variable: label,
    observed: observedValue ?? null,
    lln: predicted?.lln ?? null,
    zScore: predicted?.z_score ?? null,
    predicted: predicted?.predicted ?? null,
    percentPredicted: predicted?.percent_predicted ?? null,
  };
}

/** ATS convention: best FEV1, best FVC, etc. are each the max across all trials in the session. */
// portal_spirometry stores fev1/fvc/fev6/pefr/fef2575 scaled by 100 of their true value
// (confirmed against raw rows: e.g. fev1=299.0000009536743 -> 2.99 L, a normal clinical value;
// the float noise is itself evidence these were written as an integer x100 through a float column).
const RAW_SPIROMETRY_SCALE_FACTOR = 100;

function normalizeSpirometryValue(rawValue) {
  if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) return null;
  return Math.round((rawValue / RAW_SPIROMETRY_SCALE_FACTOR) * 100) / 100;
}

/**
 * Builds the Flow/Volume and Volume/Time chart series for a set of spirometry tests.
 *
 * portal_flow.value (flow) and portal_flow.volume are stored x100, same as portal_spirometry
 * (confirmed: early-curve flow ~139-216 -> 1.39-2.16 L/s rising toward this session's ~6.09 L/s
 * peak; volume ~5-20 -> 0.05-0.20 L trending toward this session's ~2.99 L FVC).
 * portal_volume.volume/time are already true liters/seconds — do NOT divide these by 100
 * (0.05-0.86 L and negative pre-trigger seconds are realistic real values on their own).
 */
function buildChartSeries(spirometries) {
  return {
    flowVolumeSeries: spirometries.map((s, i) => ({
      testLabel: `Test ${i + 1}`,
      points: s.flows.map((f) => ({
        volume: normalizeSpirometryValue(f.volume) ?? f.volume,
        flow: normalizeSpirometryValue(f.value) ?? f.value,
      })),
    })),
    volumeTimeSeries: spirometries.map((s, i) => ({
      testLabel: `Test ${i + 1}`,
      points: s.volumes.map((v) => ({ time: v.time, volume: v.volume })),
    })),
  };
}

function pickBestSpirometryValues(spirometries) {
  const fields = ['fev1', 'fvc', 'pefr', 'fef2575', 'fev6'];
  const best = {};

  for (const field of fields) {
    const values = spirometries
      .map((s) => normalizeSpirometryValue(s[field]))
      .filter((v) => v !== null);
    best[field] = values.length > 0 ? Math.max(...values) : null;
  }

  best.fev1FvcRatio =
    best.fev1 !== null && best.fvc !== null && best.fvc !== 0
      ? Number((best.fev1 / best.fvc).toFixed(2))
      : null;

  return best;
}

function buildResultRows(best, predictedMap) {
  return [
    buildVariableRow('FEV1', best.fev1, predictedMap),
    buildVariableRow('FVC', best.fvc, predictedMap),
    buildVariableRow('FEV1/FVC', best.fev1FvcRatio, predictedMap),
    buildVariableRow('FEF2575', best.fef2575, predictedMap),
    buildVariableRow('FEV6', best.fev6, predictedMap),
    { variable: 'PEFR', observed: best.pefr, lln: null, zScore: null, predicted: null, percentPredicted: null },
  ];
}

function buildPagination(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

async function ensurePatientExists(userId) {
  return patientRepository.findPatientCore(userId);
}

async function getPatientsList() {
  const patients = await patientRepository.findPatientsList();
  return patients.map((p) => ({ userId: p.user_id, name: `${p.l_name}, ${p.f_name}` }));
}

async function getPatientInfoTab(userId) {
  const [profile, prescriptions] = await Promise.all([
    patientRepository.findPatientProfile(userId),
    patientRepository.findActiveMedications(userId),
  ]);

  if (!profile) return null;

  const attributes = profile.patient_details?.attributes || null;
  const address = attributes?.addresses?.[0] || null;
  const medications = prescriptions.flatMap((p) => p.medicines).map((m) => m.drug);

  return {
    userId: profile.user_id,
    name: `${profile.l_name}, ${profile.f_name}`,
    username: profile.userName,
    email: profile.email,
    phone: attributes?.phone || profile.phone,
    // NOTE: schema stores height/weight as raw Float with no unit column —
    // returning the raw number; confirm units (in vs cm, lb vs kg) before formatting on the frontend.
    height: attributes?.height ?? profile.patient_details?.height ?? null,
    weight: attributes?.weight ?? profile.patient_details?.weight ?? null,
    sexAtBirth: attributes?.gender || null,
    smoking: attributes?.smoking ?? null,
    // NOTE: vf_attributes.dob is stored as VarChar, not DateTime — age calc assumes it parses as a valid date string.
    dob: attributes?.dob || null,
    age: calculateAge(attributes?.dob),
    ethnicity: attributes?.ethnic_group || null,
    startDate: attributes?.start_date || null,
    address: address
      ? `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/\s+/g, ' ').trim()
      : null,
    status: profile.user_status?.name || null,
    medications,
  };
}

/**
 * Paginated list of the patient's spirometry sessions, newest first.
 * No default filter: with no startDate/endDate, returns the patient's entire spirometry history.
 * Each row includes flow/volume curve points so the frontend can chart any row without a second call.
 */
async function getSpirometryTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [total, observations, predictedValues] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, {
      startDate,
      endDate,
      skip,
      take: limit,
      includeCurves: true,
    }),
    patientRepository.findPredictedValues(userId, SPIROMETRY_VARIABLES),
  ]);

  const predictedMap = buildPredictedMap(predictedValues);

  const rows = observations.map((observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return {
      observationId: observation.id,
      date: observation.dbdate,
      testsCount: observation.spirometries.length,
      results: buildResultRows(best, predictedMap),
      ...buildChartSeries(observation.spirometries),
    };
  });

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    rows,
  };
}

/** No default filter: with no startDate/endDate, returns the patient's entire trend/air-quality history. */
async function getAnalysisTab(userId, startDate, endDate, variable) {
  const trendField = TREND_VARIABLE_FIELDS[variable];
  if (!trendField) {
    throw new ValidationError(`variable must be one of: ${Object.keys(TREND_VARIABLE_FIELDS).join(', ')}`);
  }

  const [trends, airQuality] = await Promise.all([
    patientRepository.findSpirometryTrends(userId, startDate, endDate),
    patientRepository.findIndoorAirQuality(userId, startDate, endDate),
  ]);

  const trendPoints = trends
    .map((t) => ({ date: t.dbdate, value: t[trendField] }))
    .filter((point) => point.value !== null && point.value !== undefined);

  return {
    variable,
    startDate: startDate || null,
    endDate: endDate || null,
    mostRecent: trendPoints.length > 0 ? trendPoints[trendPoints.length - 1].value : null,
    trend: trendPoints,
    indoorAirQuality: airQuality.map((a) => ({
      date: a.dbdate,
      pm25: a.pm25,
      pm10: a.pm10,
      temperature: a.temperature,
      humidity: a.humidity,
    })),
    // Outdoor air quality is intentionally omitted — no schema/table backs it yet.
  };
}

async function getSessionComparisonTab(userId, sessionId1, sessionId2) {
  const observations = await patientRepository.findObservationsByIds([sessionId1, sessionId2]);
  const byId = new Map(observations.map((o) => [o.id, o]));

  const session1 = byId.get(sessionId1);
  const session2 = byId.get(sessionId2);

  if (!session1 || !session2 || session1.user_id !== userId || session2.user_id !== userId) {
    throw new ValidationError('One or both sessions were not found for this patient');
  }

  const predictedValues = await patientRepository.findPredictedValues(userId, SPIROMETRY_VARIABLES);
  const predictedMap = buildPredictedMap(predictedValues);

  const buildSessionSummary = (observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return {
      observationId: observation.id,
      date: observation.dbdate,
      isPostBronchodilator: observation.is_post_bronchodilator,
      results: buildResultRows(best, predictedMap),
      ...buildChartSeries(observation.spirometries),
    };
  };

  return {
    session1: buildSessionSummary(session1),
    session2: buildSessionSummary(session2),
    timeBetweenSessionsHours:
      Math.abs(new Date(session2.dbdate) - new Date(session1.dbdate)) / (1000 * 60 * 60),
  };
}

/** No default filter, paginated. With no startDate/endDate, returns the patient's full report history. */
async function getReportsTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [total, observations] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, { startDate, endDate, skip, take: limit, includeCurves: false }),
  ]);

  if (total === 0) {
    return { startDate: startDate || null, endDate: endDate || null, pagination: buildPagination(page, limit, 0), rows: [] };
  }

  const predictedValues = await patientRepository.findPredictedValues(userId, SPIROMETRY_VARIABLES);
  const predictedMap = buildPredictedMap(predictedValues);

  const rows = observations.map((observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return { observationId: observation.id, date: observation.dbdate, results: buildResultRows(best, predictedMap) };
  });

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    rows,
  };
}

/** No default filter, paginated. With no startDate/endDate, returns the patient's full billing history. */
async function getBillingTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  // Grouping is done in memory: MySQL/Prisma has no DATE()-level groupBy without a raw query.
  // Fine at typical per-patient reading volumes; revisit with a raw query if that changes.
  const observations = await patientRepository.findObservationsInRange(userId, startDate, endDate);

  const readingsByDate = new Map();
  for (const observation of observations) {
    const dateKey = observation.dbdate.toISOString().slice(0, 10);
    readingsByDate.set(dateKey, (readingsByDate.get(dateKey) || 0) + 1);
  }

  const allDailyReadings = Array.from(readingsByDate.entries())
    .map(([date, readings]) => ({ date, readings }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = allDailyReadings.length;
  const skip = (page - 1) * limit;
  const dailyReadings = allDailyReadings.slice(skip, skip + limit);

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    dailyReadings,
    totalDaysWithReadings: total,
  };
}

/** No default filter, paginated. */
async function getAlertsTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [total, alerts] = await Promise.all([
    patientRepository.countAlerts(userId, startDate, endDate),
    patientRepository.findAlertsPage(userId, { startDate, endDate, skip, take: limit }),
  ]);

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    history: alerts.map((alert) => ({
      id: alert.id,
      message: alert.message,
      created: alert.created,
      isRead: alert.is_read,
      notifications: alert.notifications.map((n) => ({ id: n.id, sentAt: n.sent_at, channel: n.channel })),
    })),
    // Alert *rule creation* (IF/THEN conditions) is not returned — no table backs alert rules yet.
  };
}

const TAB_HANDLERS = {
  'patient-info': ({ userId }) => getPatientInfoTab(userId),
  spirometry: ({ userId, startDate, endDate, page, limit }) =>
    getSpirometryTab(userId, { startDate, endDate, page, limit }),
  analysis: ({ userId, startDate, endDate, variable }) => getAnalysisTab(userId, startDate, endDate, variable),
  'session-comparison': ({ userId, sessionId1, sessionId2 }) =>
    getSessionComparisonTab(userId, sessionId1, sessionId2),
  reports: ({ userId, startDate, endDate, page, limit }) =>
    getReportsTab(userId, { startDate, endDate, page, limit }),
  billing: ({ userId, startDate, endDate, page, limit }) =>
    getBillingTab(userId, { startDate, endDate, page, limit }),
  alerts: ({ userId, startDate, endDate, page, limit }) =>
    getAlertsTab(userId, { startDate, endDate, page, limit }),
};

async function getPatientTabData(tab, params) {
  const handler = TAB_HANDLERS[tab];
  if (!handler) {
    throw new ValidationError(`Unsupported tab: ${tab}`);
  }
  return handler(params);
}

module.exports = {
  ValidationError,
  ensurePatientExists,
  getPatientsList,
  getPatientTabData,
};