const patientRepository = require('../repositories/patientRepository');
const { normalizeSpirometryValue } = require('../helpers/spirometry');
const {
  inspectDemographics,
  bestObservedValues,
  createCalculatedValues,
} = require('../helpers/spirometryParity');

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

  // Match Django exactly: currentYear − birthYear.
  // No birthday-in-year correction. No fractional age.
  return new Date().getFullYear() - birthDate.getFullYear();
}

function buildPredictedMap(predictedValues) {
  const map = new Map();
  for (const value of predictedValues) {
    if (!map.has(value.variable)) map.set(value.variable, value);
  }
  return map;
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

// Use the SAME normalized best-per-field measurements as mobile getResults.
function pickBestSpirometryValues(spirometries = []) {
  return bestObservedValues(spirometries);
}

function buildResultRows(best, demo) {
  const calculated = createCalculatedValues(best, demo);
  const metric = (variable, observed, prediction) => ({
    variable,
    observed: observed ?? null,
    lln: prediction.lln,
    zScore: prediction.zScore,
    predicted: prediction.predicted,
    percentPredicted: prediction.percentPredicted,
  });

  // Web continues to display its FEV1/FVC observed value as a 0-1 ratio.
  // The calculation uses the unrounded ratio, exactly as the mobile API does.
  const observedRatio = best.fev1FvcRatio == null
    ? null : Number(best.fev1FvcRatio.toFixed(2));

  return [
    metric('FEV1', best.fev1, calculated.fev1),
    metric('FVC', best.fvc, calculated.fvc),
    metric('FEV1/FVC', observedRatio, calculated.fev1fvc),
    metric('FEF2575', best.fef2575, calculated.fef2575),
    metric('FEV6', best.fev6, calculated.fev6),
    metric('PEFR', best.pefr, calculated.pefr),
  ];
}

/**
 * For an observation's Best table, use the most recent spirometry blow date,
 * matching the mobile controller. Fall back to the observation date only if
 * no blow has a valid timestamp.
 */
function latestTestDate(observation) {
  let latest = null;
  for (const test of observation.spirometries || []) {
    const date = test?.dbdate ? new Date(test.dbdate) : null;
    if (date && Number.isFinite(date.getTime()) && (!latest || date > latest)) {
      latest = date;
    }
  }
  return latest || observation.dbdate || null;
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
    lookupTable: attributes?.lookup_table || null,
    startDate: attributes?.start_date || null,
    address: address
      ? `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`
          .replace(/\s+/g, ' ').trim()
      : null,
    status: profile.user_status?.name || null,
    medications,
  };
}

/**
 * Exactly the same verified demographics path used by the mobile getResults:
 *   patientRepository.findPatientProfile -> inspectDemographics.
 * Does NOT invent age=40, height=170, sex=male when data or a unit is missing.
 * Height settings (must match verified DB units) are read by inspectDemographics:
 *   VITALFLO_OBSERVATION_HEIGHT_UNIT
 *   VITALFLO_ATTRIBUTES_HEIGHT_UNIT
 *   VITALFLO_PATIENT_HEIGHT_UNIT
 *
 * @param {number} userId
 * @param {number|null} observationHeight
 * @param {Date|string|null} testDate Actual blow timestamp (or observation timestamp)
 * @param {object|null} profile Optional once-per-page profile to avoid duplicate DB calls
 */
async function loadGliDemographics(userId, observationHeight = null, testDate = null, profile = null) {
  const patient = profile || await patientRepository.findPatientProfile(userId);
  if (!patient?.patient_details) return null;

  const details = patient.patient_details;
  const attrs = details.attributes || {};
  const checked = inspectDemographics({
    attributes: attrs,
    details,
    observationHeight,
    testDate,
  });
  return checked.demo;
}

async function getSpirometryTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [total, observations] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, {
      startDate, endDate, skip, take: limit, includeCurves: true,
    }),
  ]);

  const profile = observations.length
    ? await patientRepository.findPatientProfile(userId) : null;
  const rows = await Promise.all(
    observations.map(async (observation) => {
      const demo = await loadGliDemographics(
        userId, observation.height, latestTestDate(observation), profile,
      );
      const spirometries = observation.spirometries || [];
      const best = pickBestSpirometryValues(spirometries);

      return {
        observationId: observation.id,
        date: observation.dbdate,
        testsCount: spirometries.length,
        results: buildResultRows(best, demo),
        ...buildChartSeries(spirometries),
      };
    })
  );

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    rows,
  };
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
    indoorAirQuality: airQuality.map((a) => ({
      date: a.dbdate, pm25: a.pm25, pm10: a.pm10, temperature: a.temperature, humidity: a.humidity,
    })),
  };
}

async function getSessionOptions(userId, { page = 1, limit = 100 } = {}) {
  // This list uses observation IDs (the comparison API's existing ID contract).
  // Label by the most recent blow timestamp; return no records belonging to other patients.
  const [total, observations] = await Promise.all([
    patientRepository.countObservations(userId),
    patientRepository.findObservationsPage(userId, {
      skip: (page - 1) * limit, take: limit, includeCurves: false,
    }),
  ]);
  return {
    rows: observations.filter(o => o.spirometries?.length).map(o => ({
      observationId: o.id,
      date: latestTestDate(o),
      testsCount: o.spirometries.length,
    })),
    pagination: buildPagination(page, limit, total),
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

  const profile = await patientRepository.findPatientProfile(userId);
  const buildSessionSummary = async (observation) => {
    const demo = await loadGliDemographics(
      userId, observation.height, latestTestDate(observation), profile,
    );
    const best = pickBestSpirometryValues(observation.spirometries);
    return {
      observationId: observation.id,
      date: latestTestDate(observation),
      isPostBronchodilator: observation.is_post_bronchodilator,
      results: buildResultRows(best, demo),
      ...buildChartSeries(observation.spirometries),
    };
  };

  return {
    session1: await buildSessionSummary(session1),
    session2: await buildSessionSummary(session2),
    timeBetweenSessionsHours:
      Math.abs(new Date(latestTestDate(session2)) - new Date(latestTestDate(session1))) / (1000 * 60 * 60),
  };
}

async function getReportsTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [total, observations] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, {
      startDate, endDate, skip, take: limit, includeCurves: false,
    }),
  ]);

  if (total === 0) {
    return {
      startDate: startDate || null,
      endDate: endDate || null,
      pagination: buildPagination(page, limit, 0),
      rows: [],
    };
  }

  const profile = await patientRepository.findPatientProfile(userId);
  const rows = await Promise.all(
    observations.map(async (observation) => {
      const demo = await loadGliDemographics(
        userId, observation.height, latestTestDate(observation), profile,
      );
      const best = pickBestSpirometryValues(observation.spirometries);
      return {
        observationId: observation.id,
        date: observation.dbdate,
        latestTestDate: latestTestDate(observation),
        testsCount: observation.spirometries.length,
        results: buildResultRows(best, demo),
      };
    })
  );

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    pagination: buildPagination(page, limit, total),
    rows,
  };
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

async function getLegacySpirometryPdfData(userId, {
  startDate = null, endDate = null, page = null, limit = null,
} = {}) {
  // The header PDF uses the current visible page. Older callers that omit
  // page and limit still receive their original full-history PDF.
  const paged = Number.isInteger(page) && Number.isInteger(limit) && page > 0 && limit > 0;
  const batchSize = paged ? limit : 100;
  let batchPage = paged ? page : 1;
  const observations = [];
  const profile = await patientRepository.findPatientProfile(userId);

  while (true) {
    const skip = (batchPage - 1) * batchSize;
    const batch = await patientRepository.findObservationsPage(userId, {
      startDate, endDate, skip, take: batchSize, includeCurves: true,
    });
    if (!batch.length) break;

    for (const observation of batch) {
      const tests = (observation.spirometries || []).map(spirometry => {
        const bestForThisTrial = pickBestSpirometryValues([spirometry]);
        // This is a per-blow report. Use the blow's own date for GLI age.
        // Build asynchronously so demographics are loaded from the verified profile.
        return { spirometry, bestForThisTrial };
      });
      const resolvedTests = await Promise.all(tests.map(async ({ spirometry, bestForThisTrial }) => {
        const demo = await loadGliDemographics(
          userId, observation.height, spirometry.dbdate || observation.dbdate, profile,
        );
        const rows = buildResultRows(bestForThisTrial, demo);
        // portal_spirometry has no FET field in the uploaded schema.
        // Do not pretend chart duration is clinically validated FET.
        rows.push({ variable: 'FET', observed: null, lln: null,
          zScore: null, predicted: null, percentPredicted: null });

        return {
          id: spirometry.id,
          date: spirometry.dbdate || observation.dbdate,
          results: rows,
          flowPoints: (spirometry.flows || []).map(p => ({
            volume: normalizeSpirometryValue(p.volume) ?? p.volume,
            flow: normalizeSpirometryValue(p.value) ?? p.value,
          })),
          volumePoints: (spirometry.volumes || []).map(p => ({
            time: p.time,
            volume: p.volume,
          })),
        };
      }));
      observations.push({ id: observation.id, date: observation.dbdate, tests: resolvedTests });
    }

    if (paged || batch.length < batchSize) break;
    batchPage += 1;
  }

  // Stable report ordering: oldest to newest, matching the provided PDF.
  observations.sort((a, b) => new Date(a.date) - new Date(b.date));
  for (const observation of observations) {
    observation.tests.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  return { observations, referenceText: 'GLI 2012 Other Lookup Table' };
}


// Public GLI calculation surface shared by the Web tab and the legacy mobile API.
// Do NOT introduce a separate mobile-specific prediction implementation.
module.exports = {
  ValidationError, ensurePatientExists, getPatientsList,
  getPatientTabData, getLegacySpirometryPdfData,
  loadGliDemographics, pickBestSpirometryValues,
  buildResultRows, latestTestDate, getSessionOptions,
};