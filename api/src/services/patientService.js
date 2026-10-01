const patientRepository = require('../repositories/patientRepository');
const {
  calculatePredictedValues,
  calculateFev1FvcPredictedValues,
  normalizeSpirometryValue,
  toGliDemographics,
} = require('../helpers/spirometry');

class ValidationError extends Error {}

const SPIROMETRY_VARIABLES = ['FEV1', 'FVC', 'FEV1/FVC', 'FEF25-75'];

const ANALYSIS_VARIABLE_TO_BEST_FIELD = {
  FEV1: 'fev1',
  FVC: 'fvc',
  PEFR: 'pefr',
  FEF2575: 'fef2575',
  'FEV1/FVC': 'fev1FvcRatio',
};

function calculateAge(dobValue) {
  if (!dobValue) return null;
  const birthDate = new Date(dobValue);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function buildPredictedMap(predictedValues) {
  const map = new Map();
  for (const value of predictedValues) {
    if (!map.has(value.variable)) map.set(value.variable, value);
  }
  return map;
}

/** ASYNC: GLI-2012 calculation returns a Promise. */
async function buildVariableRow(label, observedValue, demo = {}, variable = 'FEV1') {
  const observed = observedValue ?? null;
  const calculated = await calculatePredictedValues(observed, demo, variable);
  return {
    variable: label,
    observed,
    lln: calculated.lln,
    zScore: calculated.zScore,
    predicted: calculated.predicted,
    percentPredicted: calculated.percentPredicted,
  };
}

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
    const values = spirometries.map((s) => normalizeSpirometryValue(s[field])).filter((v) => v !== null);
    best[field] = values.length > 0 ? Math.max(...values) : null;
  }
  best.fev1FvcRatio = best.fev1 !== null && best.fvc !== null && best.fvc !== 0 ? Number((best.fev1 / best.fvc).toFixed(2)) : null;
  return best;
}

/** ASYNC: builds results array with GLI-2012 values. */
async function buildResultRows(best, demo = {}) {
  const fev1FvcCalculated = await calculateFev1FvcPredictedValues(best.fev1FvcRatio, demo);
  const fev1Row = await buildVariableRow('FEV1', best.fev1, demo, 'FEV1');
  const fvcRow = await buildVariableRow('FVC', best.fvc, demo, 'FVC');
  const fef2575Row = await buildVariableRow('FEF2575', best.fef2575, demo, 'FEF2575');

  return [
    fev1Row,
    fvcRow,
    {
      variable: 'FEV1/FVC',
      observed: best.fev1FvcRatio,
      lln: fev1FvcCalculated.lln,
      zScore: fev1FvcCalculated.zScore,
      predicted: fev1FvcCalculated.predicted,
      percentPredicted: fev1FvcCalculated.percentPredicted,
    },
    fef2575Row,
    { variable: 'FEV6', observed: best.fev6 ?? null, lln: null, zScore: null, predicted: null, percentPredicted: null },
    { variable: 'PEFR', observed: best.pefr ?? null, lln: null, zScore: null, predicted: null, percentPredicted: null },
  ];
}

function buildPagination(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

async function ensurePatientExists(userId) { return patientRepository.findPatientCore(userId); }

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
    height: attributes?.height ?? profile.patient_details?.height ?? null,
    weight: attributes?.weight ?? profile.patient_details?.weight ?? null,
    sexAtBirth: attributes?.gender || null,
    smoking: attributes?.smoking ?? null,
    dob: attributes?.dob || null,
    age: calculateAge(attributes?.dob),
    ethnicity: attributes?.ethnic_group || null,
    startDate: attributes?.start_date || null,
    address: address ? `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/\s+/g, ' ').trim() : null,
    status: profile.user_status?.name || null,
    medications,
  };
}

async function loadGliDemographics(userId) {
  try {
    const profile = await patientRepository.findPatientProfile(userId);
    if (!profile) return { age: 40, height: 170, sex: 1, ethnicity: 5 };
    const attrs = profile.patient_details?.attributes || {};
    return toGliDemographics({
      age: calculateAge(attrs.dob),
      attributes: { height: attrs.height, gender: attrs.gender, ethnic_group: attrs.ethnic_group },
      patient_details: profile.patient_details,
    });
  } catch (_err) {
    return { age: 40, height: 170, sex: 1, ethnicity: 5 };
  }
}

async function getSpirometryTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [total, observations, demo] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, { startDate, endDate, skip, take: limit, includeCurves: true }),
    loadGliDemographics(userId),
  ]);

  const rows = await Promise.all(observations.map(async (observation) => {
    const spirometries = observation.spirometries || [];
    const best = pickBestSpirometryValues(spirometries);
    return {
      observationId: observation.id,
      date: observation.dbdate,
      testsCount: spirometries.length,
      results: await buildResultRows(best, demo),
      ...buildChartSeries(spirometries),
    };
  }));

  return { startDate: startDate || null, endDate: endDate || null, pagination: buildPagination(page, limit, total), rows };
}

async function getAnalysisTab(userId, startDate, endDate, variable) {
  const bestField = ANALYSIS_VARIABLE_TO_BEST_FIELD[variable];
  if (!bestField) {
    throw new ValidationError(`variable must be one of: ${Object.keys(ANALYSIS_VARIABLE_TO_BEST_FIELD).join(', ')}`);
  }
  const [observations, airQuality] = await Promise.all([
    patientRepository.findObservationsInRange(userId, startDate, endDate),
    patientRepository.findIndoorAirQuality(userId, startDate, endDate),
  ]);
  const trendPoints = observations
    .map((observation) => {
      const best = pickBestSpirometryValues(observation.spirometries);
      return { date: observation.dbdate, value: best[bestField] };
    })
    .filter((point) => point.value !== null && point.value !== undefined);
  return {
    variable,
    startDate: startDate || null,
    endDate: endDate || null,
    mostRecent: trendPoints.length > 0 ? trendPoints[trendPoints.length - 1].value : null,
    trend: trendPoints,
    indoorAirQuality: airQuality.map((a) => ({ date: a.dbdate, pm25: a.pm25, pm10: a.pm10, temperature: a.temperature, humidity: a.humidity })),
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
  const demo = await loadGliDemographics(userId);
  const buildSessionSummary = async (observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return {
      observationId: observation.id,
      date: observation.dbdate,
      isPostBronchodilator: observation.is_post_bronchodilator,
      results: await buildResultRows(best, demo),
      ...buildChartSeries(observation.spirometries),
    };
  };
  return {
    session1: await buildSessionSummary(session1),
    session2: await buildSessionSummary(session2),
    timeBetweenSessionsHours: Math.abs(new Date(session2.dbdate) - new Date(session1.dbdate)) / (1000 * 60 * 60),
  };
}

async function getReportsTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [total, observations, demo] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, { startDate, endDate, skip, take: limit, includeCurves: false }),
    loadGliDemographics(userId),
  ]);
  if (total === 0) {
    return { startDate: startDate || null, endDate: endDate || null, pagination: buildPagination(page, limit, 0), rows: [] };
  }
  const rows = await Promise.all(observations.map(async (observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return { observationId: observation.id, date: observation.dbdate, results: await buildResultRows(best, demo) };
  }));
  return { startDate: startDate || null, endDate: endDate || null, pagination: buildPagination(page, limit, total), rows };
}

async function getBillingTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
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
  return { startDate: startDate || null, endDate: endDate || null, pagination: buildPagination(page, limit, total), dailyReadings, totalDaysWithReadings: total };
}

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
  };
}

const TAB_HANDLERS = {
  'patient-info': ({ userId }) => getPatientInfoTab(userId),
  spirometry: ({ userId, startDate, endDate, page, limit }) => getSpirometryTab(userId, { startDate, endDate, page, limit }),
  analysis: ({ userId, startDate, endDate, variable }) => getAnalysisTab(userId, startDate, endDate, variable),
  'session-comparison': ({ userId, sessionId1, sessionId2 }) => getSessionComparisonTab(userId, sessionId1, sessionId2),
  reports: ({ userId, startDate, endDate, page, limit }) => getReportsTab(userId, { startDate, endDate, page, limit }),
  billing: ({ userId, startDate, endDate, page, limit }) => getBillingTab(userId, { startDate, endDate, page, limit }),
  alerts: ({ userId, startDate, endDate, page, limit }) => getAlertsTab(userId, { startDate, endDate, page, limit }),
};

async function getPatientTabData(tab, params) {
  const handler = TAB_HANDLERS[tab];
  if (!handler) throw new ValidationError(`Unsupported tab: ${tab}`);
  return handler(params);
}

module.exports = { ValidationError, ensurePatientExists, getPatientsList, getPatientTabData };