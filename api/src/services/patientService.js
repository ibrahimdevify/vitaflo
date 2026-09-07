const patientRepository = require('../repositories/patientRepository');

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
function pickBestSpirometryValues(spirometries) {
  const fields = ['fev1', 'fvc', 'pefr', 'fef2575', 'fev6'];
  const best = {};

  for (const field of fields) {
    const values = spirometries
      .map((s) => s[field])
      .filter((v) => typeof v === 'number' && !Number.isNaN(v));
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

async function getSpirometryTab(userId, date) {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const observations = await patientRepository.findObservationsByDate(userId, startOfDay, endOfDay);
  const allSpirometries = observations.flatMap((o) => o.spirometries);

  if (allSpirometries.length === 0) {
    return { date, testsCount: 0, bestResults: [], flowVolumeSeries: [], volumeTimeSeries: [] };
  }

  const predictedValues = await patientRepository.findPredictedValues(userId, SPIROMETRY_VARIABLES);
  const predictedMap = buildPredictedMap(predictedValues);
  const best = pickBestSpirometryValues(allSpirometries);

  return {
    date,
    testsCount: allSpirometries.length,
    bestResults: buildResultRows(best, predictedMap),
    flowVolumeSeries: allSpirometries.map((s, i) => ({
      testLabel: `Test ${i + 1}`,
      points: s.flows.map((f) => ({ volume: f.volume, flow: f.value })),
    })),
    volumeTimeSeries: allSpirometries.map((s, i) => ({
      testLabel: `Test ${i + 1}`,
      points: s.volumes.map((v) => ({ time: v.time, volume: v.volume })),
    })),
  };
}

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
      flowVolumeSeries: observation.spirometries.map((s, i) => ({
        testLabel: `Test ${i + 1}`,
        points: s.flows.map((f) => ({ volume: f.volume, flow: f.value })),
      })),
      volumeTimeSeries: observation.spirometries.map((s, i) => ({
        testLabel: `Test ${i + 1}`,
        points: s.volumes.map((v) => ({ time: v.time, volume: v.volume })),
      })),
    };
  };

  return {
    session1: buildSessionSummary(session1),
    session2: buildSessionSummary(session2),
    timeBetweenSessionsHours:
      Math.abs(new Date(session2.dbdate) - new Date(session1.dbdate)) / (1000 * 60 * 60),
  };
}

async function getReportsTab(userId, startDate, endDate) {
  const observations = await patientRepository.findObservationsInRange(userId, startDate, endDate);

  if (observations.length === 0) {
    return { startDate, endDate, rows: [] };
  }

  const predictedValues = await patientRepository.findPredictedValues(userId, SPIROMETRY_VARIABLES);
  const predictedMap = buildPredictedMap(predictedValues);

  const rows = observations.map((observation) => {
    const best = pickBestSpirometryValues(observation.spirometries);
    return { date: observation.dbdate, results: buildResultRows(best, predictedMap) };
  });

  return { startDate, endDate, rows };
}

async function getBillingTab(userId, startDate, endDate) {
  const observations = await patientRepository.findObservationsInRange(userId, startDate, endDate);

  const readingsByDate = new Map();
  for (const observation of observations) {
    const dateKey = observation.dbdate.toISOString().slice(0, 10);
    readingsByDate.set(dateKey, (readingsByDate.get(dateKey) || 0) + 1);
  }

  const dailyReadings = Array.from(readingsByDate.entries())
    .map(([date, readings]) => ({ date, readings }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    startDate,
    endDate,
    dailyReadings,
    totalDaysWithReadings: dailyReadings.length,
    // Billing-cycle thresholds (e.g. "16 of 30 days") aren't stored anywhere — no config table exists.
    // Returning raw counts only; apply the threshold on the frontend or add a config table for it.
  };
}

async function getAlertsTab(userId) {
  const alerts = await patientRepository.findAlertHistory(userId);

  return {
    history: alerts.map((alert) => ({
      id: alert.id,
      message: alert.message,
      created: alert.created,
      isRead: alert.is_read,
      notifications: alert.notifications.map((n) => ({
        id: n.id,
        sentAt: n.sent_at,
        channel: n.channel,
      })),
    })),
    // Alert *rule creation* (IF/THEN conditions) is not returned — no table backs alert rules yet.
  };
}

const TAB_HANDLERS = {
  'patient-info': ({ userId }) => getPatientInfoTab(userId),
  spirometry: ({ userId, date }) => getSpirometryTab(userId, date),
  analysis: ({ userId, startDate, endDate, variable }) => getAnalysisTab(userId, startDate, endDate, variable),
  'session-comparison': ({ userId, sessionId1, sessionId2 }) =>
    getSessionComparisonTab(userId, sessionId1, sessionId2),
  reports: ({ userId, startDate, endDate }) => getReportsTab(userId, startDate, endDate),
  billing: ({ userId, startDate, endDate }) => getBillingTab(userId, startDate, endDate),
  alerts: ({ userId }) => getAlertsTab(userId),
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