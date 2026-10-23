const patientRepository = require('../repositories/patientRepository');
const { normalizeSpirometryValue } = require('../helpers/spirometry');
const {
  demographicsForTest, bestObservedValues, createCalculatedValues,
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
        volume: Number(f.volume ?? 0),
        flow: Number(f.value ?? 0),
      })),
    })),
    volumeTimeSeries: spirometries.map((s, i) => ({
      testLabel: `Test ${i + 1}`,
      points: s.volumes.map((v) => ({ time: v.time, volume: v.volume })),
    })),
  };
}

// Same normalization, best-selection and GLI references are used by mobile.
const pickBestSpirometryValues = bestObservedValues;

function buildResultRows(best, demo) {
  const prediction = createCalculatedValues(best, demo);
  const row = (variable, observed, predictionValue) => ({
    variable, observed: observed ?? null,
    lln: predictionValue.lln,
    zScore: predictionValue.zScore,
    predicted: predictionValue.predicted,
    percentPredicted: predictionValue.percentPredicted,
  });
  return [
    row('FEV1', best.fev1, prediction.fev1),
    row('FVC', best.fvc, prediction.fvc),
    // Web contract continues to display ratio 0..1; mobile retains 0..100.
    row('FEV1/FVC', best.fev1FvcRatio == null ? null : Number(best.fev1FvcRatio.toFixed(2)), prediction.fev1fvc),
    row('FEF2575', best.fef2575, prediction.fef2575),
    row('FEV6', best.fev6, prediction.fev6),
    row('PEFR', best.pefr, prediction.pefr),
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
 * Same patient demographics + test-date calculation used by mobile Results API.
 * No guessed defaults for DOB/height/sex: invalid data yields null prediction.
 */
async function loadGliDemographics(userId, observationHeight = null, testDate = null) {
  const profile = await patientRepository.findPatientProfile(userId);
  if (!profile) return null;
  const details = profile.patient_details || {};
  return demographicsForTest({
    attributes: details.attributes || {},
    details,
    observationHeight,
    testDate,
  });
}

async function getSpirometryTab(userId, { startDate, endDate, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [total, observations] = await Promise.all([
    patientRepository.countObservations(userId, startDate, endDate),
    patientRepository.findObservationsPage(userId, {
      startDate, endDate, skip, take: limit, includeCurves: true,
    }),
  ]);

  const rows = await Promise.all(
    observations.map(async (observation) => {
      const spirometries = observation.spirometries || [];
      const latestTest = spirometries.reduce((latest, sp) =>
        !latest || new Date(sp.dbdate) > new Date(latest.dbdate) ? sp : latest, null);
      const demo = await loadGliDemographics(
        userId, observation.height, latestTest?.dbdate || observation.dbdate);
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

async function getSessionComparisonTab(userId, sessionId1, sessionId2) {
  const observations = await patientRepository.findObservationsByIds([sessionId1, sessionId2]);
  const byId = new Map(observations.map((o) => [o.id, o]));
  const session1 = byId.get(sessionId1);
  const session2 = byId.get(sessionId2);

  if (!session1 || !session2 || session1.user_id !== userId || session2.user_id !== userId) {
    throw new ValidationError('One or both sessions were not found for this patient');
  }

  const buildSessionSummary = async (observation) => {
    const demo = await loadGliDemographics(userId, observation.height, observation.dbdate);
    const best = pickBestSpirometryValues(observation.spirometries);
    return {
      observationId: observation.id,
      date: observation.dbdate,
      isPostBronchodilator: observation.is_post_bronchodilator,
      results: buildResultRows(best, demo),
      ...buildChartSeries(observation.spirometries),
    };
  };

  return {
    session1: await buildSessionSummary(session1),
    session2: await buildSessionSummary(session2),
    timeBetweenSessionsHours:
      Math.abs(new Date(session2.dbdate) - new Date(session1.dbdate)) / (1000 * 60 * 60),
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

  const rows = await Promise.all(
    observations.map(async (observation) => {
      const demo = await loadGliDemographics(userId, observation.height, observation.dbdate);
      const best = pickBestSpirometryValues(observation.spirometries);
      return {
        observationId: observation.id,
        date: observation.dbdate,
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

async function getLegacySpirometryPdfData(userId, { startDate = null, endDate = null } = {}) {
  const limit = 100;
  let page = 1;
  const observations = [];
  const profile = await patientRepository.findPatientProfile(userId);
  const profileDetails = profile?.patient_details || {};
  const profileAttributes = profileDetails.attributes || {};

  while (true) {
    const skip = (page - 1) * limit;
    const batch = await patientRepository.findObservationsPage(userId, {
      startDate, endDate, skip, take: limit, includeCurves: true,
    });
    if (!batch.length) break;

    for (const observation of batch) {
      const tests = (observation.spirometries || []).map(spirometry => {
        const demo = demographicsForTest({
          attributes: profileAttributes,
          details: profileDetails,
          observationHeight: observation.height,
          testDate: spirometry.dbdate || observation.dbdate,
        });
        const bestForThisTrial = pickBestSpirometryValues([spirometry]);
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
      });
      observations.push({ id: observation.id, date: observation.dbdate, tests });
    }

    if (batch.length < limit) break;
    page += 1;
  }

  // Stable report ordering: oldest to newest, matching the provided PDF.
  observations.sort((a, b) => new Date(a.date) - new Date(b.date));
  for (const observation of observations) {
    observation.tests.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  return { observations, referenceText: 'GLI 2012 Other Lookup Table' };
}


module.exports = { ValidationError, ensurePatientExists, getPatientsList, getPatientTabData, getLegacySpirometryPdfData };