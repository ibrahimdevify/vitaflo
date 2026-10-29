const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { randomUUID } = require('node:crypto');
// Build answer choices helper
const buildChoices = (opts) =>
  opts.map((o, i) => ({
    label: o,
    response_code: o
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, ""),
    sort_order: i + 1,
  }));

// Survey questions
const surveyQuestions = [
  {
    message_id: 101,
    text: ["Are you experiencing any symptoms today?"],
    message_type: "multiple_choice",
    question_type: "multiple_choice_select_one",
    answer_choices: buildChoices([
      "No symptoms",
      "Cough",
      "Wheezing",
      "Shortness of breath",
      "Chest tightness",
    ]),
  },
  {
    message_id: 102,
    text: ["How many times did you use your rescue inhaler today?"],
    message_type: "multiple_choice",
    question_type: "multiple_choice_select_one",
    answer_choices: buildChoices([
      "0 times",
      "1-2 times",
      "3-4 times",
      "More than 4 times",
    ]),
  },
  {
    message_id: 103,
    text: ["Rate your sleep quality last night (1-5)"],
    message_type: "rating",
    question_type: "multiple_choice_select_one",
    answer_choices: buildChoices(["1", "2", "3", "4", "5"]),
  },
  {
    message_id: 104,
    text: ["Rate your activity level today (1-5)"],
    message_type: "rating",
    question_type: "multiple_choice_select_one",
    answer_choices: buildChoices(["1", "2", "3", "4", "5"]),
  },
];

const syncSpirometry = async (req, res) => {
  try {
    const { results, sharedPrefsId, sessionGrade } = req.body;
    const userId = req.user.user_id;
    const now = new Date();
    let parsedResults;
    try {
      parsedResults =
        typeof results === "string" ? JSON.parse(results) : results;
    } catch {
      return res.status(400).json({ error: "Invalid results format" });
    }
    const observation = await prisma.portal_observation.create({
      data: { user_id: userId, dbdate: now, is_post_bronchodilator: false },
    });
    if (parsedResults.values && Array.isArray(parsedResults.values)) {
      for (const val of parsedResults.values) {
        console.log("Creating spirometry with:", {
          fvc: val.fvcL || val.fvc,
          fev1: val.fev1L || val.fev1,
          pefr: val.pefLs || val.pefr,
        });
        await prisma.portal_spirometry
          .create({
            data: {
              observation_id: observation.id,
              fvc: val.fvc,
              fev1: val.fev1,
              pefr: val.pefr,
              fef2575: val.fef2575,
              fev6: val.fev6,
              fev1_perc: val.fev1_perc,
            },
          })
          .catch(() => {});
      }
    }
    res.json({
      response: {
        status: "success",
        message: "Spirometry records synchronized successfully.",
        sharedPrefsId: sharedPrefsId || "",
        observation_id: observation.id,
      },
    });
  } catch (error) {
    console.error("sync_plus DB error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to save spirometry", message: error.message });
  }
};

const syncSpirometryPlus = async (req, res) => {
  try {
    const {
      results,
      sharedPrefsId,
      isPostBronchodilator,
      attributes,
      sessionGrade,
    } = req.body;
    const userId = req.user.user_id;
    const now = new Date();
    let parsedResults;
    try {
      parsedResults =
        typeof results === "string" ? JSON.parse(results) : results;
    } catch {
      return res.status(400).json({ error: "Invalid results format" });
    }
    const dataPoints = Array.isArray(parsedResults)
      ? parsedResults
      : [parsedResults];
    let timeCounter = 0;
    for (const point of dataPoints) {
      if (point.time === null || point.time === undefined) {
        point.time = now.getTime() + timeCounter;
        timeCounter++;
      }
      if (!point.dbdate) point.dbdate = now;
    }
    if (attributes) {
      const patient = await prisma.dc_patient_details.findFirst({
        where: { user_id_fk: userId },
      });
      if (patient) {
        await prisma.vf_attributes
          .upsert({
            where: { pd_id: patient.pd_id },
            update: {
              height: attributes.height || undefined,
              weight: attributes.weight || undefined,
            },
            // FIX: vf_attributes.dob is a required (non-nullable) column with
            // no default. The original create block omitted it entirely,
            // which throws a Prisma "missing required field" error the
            // first time a patient's attributes row doesn't exist yet
            // (i.e. any patient who hasn't already got a vf_attributes row
            // from the migration or elsewhere). Defaulting to "" keeps this
            // endpoint from crashing; the app should prompt the patient to
            // fill in a real DOB later if this placeholder is still present.
            create: {
              pd_id: patient.pd_id,
              first_name: "",
              last_name: "",
              dob: attributes.dob || "",
              height: attributes.height,
              weight: attributes.weight,
            },
          })
          .catch(() => {});
      }
    }
    const observation = await prisma.portal_observation.create({
      data: {
        user_id: userId,
        dbdate: now,
        is_post_bronchodilator:
          isPostBronchodilator === "true" || isPostBronchodilator === true,
        height: attributes?.height,
      },
    });
    // First create a spirometry record to link flows to
    let spirometryId = null;
    const resultsArr = Array.isArray(parsedResults)
      ? parsedResults
      : parsedResults.values || [parsedResults];
    for (const val of resultsArr) {
      if (val.fvcL || val.fev1L || val.fvc || val.fev1) {
        const sp = await prisma.portal_spirometry.create({
          data: {
            observation_id: observation.id,
            fvc: val.fvcL || val.fvc || 0,
            fev1: val.fev1L || val.fev1 || 0,
            pefr: val.pefLs || val.pefr || 0,
            fef2575: val.fef2575Ls || val.fef2575 || 0,
            fev6: val.fev6L || val.fev6 || 0,
            fev1_perc: val.fev1Perc || val.fev1_perc || 0,
            btps: val.btps || 0,
            temp_celsius: val.tempCelsius || 0,
            quality_message: val.qualityMessage
              ? parseFloat(val.qualityMessage)
              : null,
          },
        });
        spirometryId = sp.id;
      }
    }

    // Now store flow/volume data properly linked to spirometry
    const fvPoints = parsedResults.fvPoints || parsedResults[0]?.fvPoints || [];
    const flowPoints =
      fvPoints.length > 0
        ? fvPoints
        : dataPoints.filter(
            (p) => p.flow !== undefined || p.volume !== undefined,
          );
    if (spirometryId && flowPoints.length > 0) {
      // Calculate time values from MIR sample rate (53ms per step based on stepVolume:50)
      const totalPoints = flowPoints.length;
      const fetS =
        parsedResults.fetS || parsedResults[0]?.fetS || totalPoints * 0.053;
      const timeStep = fetS / totalPoints;

      for (let i = 0; i < flowPoints.length; i++) {
        const point = flowPoints[i];
        const calculatedTime = parseFloat((i * timeStep).toFixed(4));
        await prisma.portal_flow
          .create({
            data: {
              spirometry_id: spirometryId,
              time: point.time || calculatedTime || i * 0.053,
              value: point.flow || 0,
              volume: point.volume || 0,
              dbdate: point.dbdate || now,
            },
          })
          .catch(() => {});
      }
    }
    res.json({
      response: {
        status: "success",
        message: "Spirometry records synchronized successfully.",
        sharedPrefsId: sharedPrefsId || "",
      },
    });
  } catch (error) {
    console.error("sync_plus DB error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to save spirometry", message: error.message });
  }
};

/**
 * Existing mobile history JSON stays a list of the same measurement fields.
 * Apply the same legacy measurement normalization as Web and mobile Results.
 */
const getSpirometryByUser = async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const { canReadPatient } = require('../../helpers/patientScope');
    if (!(await canReadPatient(req.user, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { normalizeSpirometry } = require('../../helpers/spirometry');
    const { start, end } = req.query;
    const range = {};
    const boundary = (value, isEnd) => {
      if (!value || typeof value !== 'string') return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const d = new Date(`${value}T00:00:00.000Z`);
        if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
        if (isEnd) d.setUTCDate(d.getUTCDate() + 1);
        return { date: d, exclusive: isEnd };
      }
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : { date: d, exclusive: false };
    };
    if (start) {
      const parsed = boundary(start, false);
      if (!parsed) return res.status(400).json({ error: 'Invalid start date' });
      range.gte = parsed.date;
    }
    if (end) {
      const parsed = boundary(end, true);
      if (!parsed) return res.status(400).json({ error: 'Invalid end date' });
      range[parsed.exclusive ? 'lt' : 'lte'] = parsed.date;
    }
    const tests = await prisma.portal_spirometry.findMany({
      // Filter by actual maneuver time, matching the Web/Results controllers.
      where: { observation: { is: { user_id: userId } },
        ...(Object.keys(range).length ? { dbdate: range } : {}) },
      orderBy: [{ dbdate: 'desc' }, { id: 'desc' }],
    });
    res.setHeader('Cache-Control', 'private, no-store');
    return res.json(tests.map(sp => {
      const value = normalizeSpirometry(sp);
      return {
        dbdate: sp.dbdate,
        fev1: value.fev1, fvc: value.fvc, pefr: value.pefr,
        fev1_fvc_ratio: value.fev1_fvc_ratio == null ? null :
          Number((value.fev1_fvc_ratio * 100).toFixed(1)),
        fef2575: value.fef2575,
        fev1_perc: sp.fev1_perc,
      };
    }));
  } catch (error) {
    console.error('[VitalFlo mobile history]', error);
    return res.status(500).json({ error: 'Failed to fetch spirometry' });
  }
};

/**
 * Keep the existing /api2/predicted/:user_id JSON keys for Flutter.
 * Reference values are calculated with the same GLI2012 coefficients and
 * demographics resolver used by web Spirometry and mobile Results.
 * Never invent a default age, sex, height, PEFR or FEV6 prediction.
 */
const getPredictedValues = async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const { canReadPatient } = require('../../helpers/patientScope');
    if (!(await canReadPatient(req.user, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const patientRepository = require('../../repositories/patientRepository');
    const { inspectDemographics, bestObservedValues, createCalculatedValues } =
      require('../../helpers/spirometryParity');
    const { referencePrediction } = require('../../helpers/gliReference');

    const profile = await patientRepository.findPatientProfile(userId);
    if (!profile?.patient_details) return res.status(404).json({ error: 'Patient not found' });

    const latest = await prisma.portal_spirometry.findFirst({
      where: { observation: { is: { user_id: userId } } },
      orderBy: [{ dbdate: 'desc' }, { id: 'desc' }],
      include: { observation: { select: { height: true } } },
    });
    const details = profile.patient_details;
    const demo = inspectDemographics({
      attributes: details.attributes || {}, details,
      observationHeight: latest?.observation?.height ?? null,
      testDate: latest?.dbdate || new Date(),
    }).demo;
    const observed = latest ? bestObservedValues([latest]) : {};
    const calculated = createCalculatedValues(observed, demo);

    const shape = (metric, variable) => {
      const actual = calculated[metric];
      const reference = referencePrediction(demo, variable);
      return {
        normal: actual?.predicted ?? reference.predicted,
        lowerLimitOfNormal: actual?.lln ?? reference.lln,
        upperLimitOfNormal: reference.uln,
        percentPredicted: actual?.percentPredicted ?? null,
        zScore: actual?.zScore ?? null,
      };
    };
    const absent = () => ({
      normal: null, lowerLimitOfNormal: null, upperLimitOfNormal: null,
      percentPredicted: null, zScore: null,
    });
    const ratio = shape('fev1fvc', 'FEV1FVC');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.json({
      fev1: shape('fev1', 'FEV1'),
      fvc: shape('fvc', 'FVC'),
      pefr: absent(),  // No verified PEF reference coefficients in this project.
      fev6: absent(),  // No verified FEV6 reference coefficients in this project.
      fev1Fvc: ratio,
      fev1fvc: ratio,
      fef2575: shape('fef2575', 'FEF2575'),
    });
  } catch (error) {
    console.error('[VitalFlo predicted values]', error);
    return res.status(500).json({ error: 'Failed to fetch predicted values' });
  }
};

const computeAlerts = async (req, res) => {
  try {
    const recentObs = await prisma.portal_observation.findMany({
      where: { user_id: parseInt(req.params.user_id) },
      include: { spirometries: true },
      orderBy: { dbdate: "desc" },
      take: 10,
    });
    const alerts = [];
    if (recentObs.length >= 2) {
      const latest = recentObs[0].spirometries[0],
        previous = recentObs[1].spirometries[0];
      if (latest && previous && latest.fev1 && previous.fev1) {
        const change = ((latest.fev1 - previous.fev1) / previous.fev1) * 100;
        if (change < -10)
          alerts.push({
            type: "declining_fev1",
            severity: "warning",
            message: `FEV1 declined ${Math.abs(change).toFixed(1)}%`,
            timestamp: new Date().toISOString(),
          });
      }
    }
    res.json({ alerts, has_active_alerts: alerts.length > 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to compute alerts" });
  }
};

const submitPreSpiroSurvey = async (req, res) => {
  try {
    const note = await prisma.portal_notes.create({
      data: {
        user_id: req.user.user_id,
        text: JSON.stringify(req.body),
        recorded_date: new Date(),
        page: "pre-spirometry",
      },
    });
    res.json({ saved: true, survey_id: note.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to save survey" });
  }
};

const getPreSpiroSurvey = async (req, res) => {
  const surveys = {
    US: {
      questions: [
        {
          id: "feeling_symptom",
          text: "Are you experiencing any symptoms today?",
          type: "boolean",
        },
        {
          id: "symptom_type",
          text: "What symptoms are you experiencing?",
          type: "multiselect",
          options: [
            "cough",
            "wheezing",
            "shortness_of_breath",
            "chest_tightness",
          ],
        },
        {
          id: "used_rescue_inhaler",
          text: "Have you used your rescue inhaler in the last 4 hours?",
          type: "boolean",
        },
        {
          id: "hours_since_medication",
          text: "Hours since last medication?",
          type: "number",
        },
        {
          id: "sleep_quality",
          text: "Rate your sleep quality (1-5)",
          type: "rating",
        },
        {
          id: "activity_level",
          text: "Rate your activity level (1-5)",
          type: "rating",
        },
      ],
    },
    ES: {
      questions: [
        {
          id: "feeling_symptom",
          text: "¿Tiene síntomas hoy?",
          type: "boolean",
        },
        {
          id: "symptom_type",
          text: "¿Qué síntomas tiene?",
          type: "multiselect",
          options: [
            "tos",
            "sibilancias",
            "falta_de_aire",
            "opresión_en_el_pecho",
          ],
        },
        {
          id: "used_rescue_inhaler",
          text: "¿Ha usado su inhalador de rescate en las últimas 4 horas?",
          type: "boolean",
        },
        {
          id: "hours_since_medication",
          text: "¿Horas desde la última medicación?",
          type: "number",
        },
        {
          id: "sleep_quality",
          text: "Califique la calidad de su sueño (1-5)",
          type: "rating",
        },
        {
          id: "activity_level",
          text: "Califique su nivel de actividad (1-5)",
          type: "rating",
        },
      ],
    },
  };
  const lang = req.query.lang || "US";
  const result = surveys[lang] || surveys.US;
  result.tags = [];
  result.selected_answers = [];
  res.json(result);
};

const takeSurvey = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message_id, message_answer, language } = req.body || {};

    await prisma.portal_notes.create({
      data: {
        user_id: userId,
        text: JSON.stringify({ message_id, message_answer, language }),
        recorded_date: new Date(),
        page: "survey",
      },
    });

    const currentId = message_id && message_id > 0 ? message_id : 0;
    const currentIndex = surveyQuestions.findIndex(
      (q) => q.message_id === currentId,
    );
    const nextIndex = currentIndex + 1;

    if (nextIndex < surveyQuestions.length) {
      const next = surveyQuestions[nextIndex];
      res.json({
        response_id: nextIndex + 1,
        saved: true,
        survey_complete: false,
        message_id: next.message_id,
        valid_regex: null,
        message_type: next.message_type,
        question_type: next.question_type,
        allow_null_response: false,
        language: language || "en",
        is_completed: false,
        text: next.text,
        answer_choices: next.answer_choices,
      });
    } else {
      res.json({
        response_id: nextIndex + 1,
        saved: true,
        survey_complete: true,
        message_id: null,
        valid_regex: null,
        message_type: "summary",
        question_type: "multiple_choice_select_one",
        allow_null_response: true,
        language: language || "en",
        is_completed: true,
        text: ["Thank you for completing your daily survey!"],
        answer_choices: [],
      });
    }
  } catch (error) {
    console.error("Take survey error:", error);
    res.status(500).json({ error: "Failed to save survey" });
  }
};

// The old buildBestSpirometry helper guessed predicted values using /0.85 and
// an arbitrary 80% LLN. It was unused and is removed; calculations now flow
// exclusively through spirometryParity.createCalculatedValues.

// Calculate lung age from FEV1
const calcLungAge = (fev1, heightCm, gender) => {
  if (!fev1 || !heightCm) return null;
  const sex = String(gender || '').trim().toLowerCase();
  if (!['m', 'male', '1', 'f', 'female', '2'].includes(sex)) return null;
  const heightInches = heightCm / 2.54;
  let lungAge;
  if (['m', 'male', '1'].includes(sex)) {
    lungAge = 2.87 * heightInches - 31.25 * fev1 - 39.375;
  } else {
    lungAge = 3.56 * heightInches - 40.0 * fev1 - 77.28;
  }
  return parseFloat(Math.max(15, Math.min(95, lungAge)).toFixed(1));
};
/**
 * Replace ONLY the existing getResults controller function with this function.
 * Keep the existing route, prisma instance, calcLungAge, and module.exports.
 * Uses src/helpers/spirometry.js from a controller in src/controllers/.
 * Returns only the most recently recorded blow within the requested date range.
 */
/**
 * VitalFlo - replace ONLY the getResults controller function.
 * Existing route: GET /api2/results/:patient_id/:start_date/:end_date?page=1&per_page=10
 * Requirements: prisma and calcLungAge already available in controller scope.
 * If controller is not in src/controllers, adjust the helper import path.
 * Authorization / patient access middleware on the original route MUST remain active.
 * One spirometry blow per indexed "session", newest first; all blows paginated.
 */
/**
 * VitalFlo Results API — paginated, legacy Flutter double-compatible.
 *
 * Replace the previous getResults function and add the serializer shown below
 * in the SAME controller file. Keep your existing Prisma instance,
 * calcLungAge helper, exports, middleware and route unchanged.
 *
 * Route: GET /api2/results/:patient_id/:start_date/:end_date
 * Optional query: ?page=1&per_page=10&tz_offset_minutes=300
 *
 * This patch leaves dates, filtering, prediction calculations, pagination,
 * numeric IDs and nulls alone. Only whole-number MEASUREMENT JSON tokens
 * are formatted as 2.0 instead of 2 for strict older Flutter parsers.
 */



const METRICS = Object.freeze([
  'fev1', 'fvc', 'fev1fvc', 'fef2575', 'fev6', 'pefr', 'fet',
]);
const MEASUREMENT_FIELDS = new Set([
  'observed', 'value', 'lln', 'zscore', 'percentPredicted', 'flow', 'volume', 'time',
]);

function serializeLegacyFlutterResults(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Expected Results API response object');
  }

  // Identify ONLY the objects that hold decimal measurements.
  // Do not touch numeric identifiers, grades, pagination, statuses, etc.
  const measurementParents = new WeakSet();
  const markMetric = (metric) => {
    if (!metric || typeof metric !== 'object' || Array.isArray(metric)) return;
    measurementParents.add(metric);
    if (metric.predicted && typeof metric.predicted === 'object') {
      for (const lookupValues of Object.values(metric.predicted)) {
        if (lookupValues && typeof lookupValues === 'object' &&
            !Array.isArray(lookupValues)) {
          measurementParents.add(lookupValues);
        }
      }
    }
  };

  for (const sessionGroup of Object.values(payload.spirometries ?? {})) {
    for (const test of Object.values(sessionGroup ?? {})) {
      if (!test || typeof test !== 'object') continue;
      for (const name of METRICS) markMetric(test[name]);
      for (const direction of ['expiratory', 'inspiratory']) {
        for (const point of (test.flows?.[direction] ?? [])) {
          if (point && typeof point === 'object' && !Array.isArray(point)) {
            measurementParents.add(point);
          }
        }
      }
    }
  }

  for (const best of Object.values(payload.best_spirometries ?? {})) {
    if (!best || typeof best !== 'object') continue;
    for (const name of METRICS) markMetric(best[name]);
  }

  const lungAges = payload.lung_ages;
  const prefix = `__vf_float_${randomUUID().replace(/-/g, '')}_`;
  const integerMeasurements = [];

  // Use distinct placeholders during serialization; replace those placeholders
  // with numeric 0.0, 2.0, 95.0 tokens AFTER JSON.stringify completes.
  // A random prefix makes collisions with user-supplied strings negligible.
  const json = JSON.stringify(payload, function (key, value) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) return value;

    const isLungAge = this === lungAges;
    const isMeasurement = measurementParents.has(this) &&
      MEASUREMENT_FIELDS.has(key);

    if (isLungAge || isMeasurement) {
      const index = integerMeasurements.push(value) - 1;
      return `${prefix}${index}__`;
    }
    return value;
  });

  const marker = new RegExp(`"${prefix}(\\d+)__"`, 'g');
  return json.replace(marker, (_match, index) =>
    `${integerMeasurements[Number(index)]}.0`);
}

function sendLegacyFlutterResults(res, payload) {
  return res.type('application/json').send(serializeLegacyFlutterResults(payload));
}


/**
 * VitalFlo - replace ONLY the getResults controller function.
 * Existing route: GET /api2/results/:patient_id/:start_date/:end_date?page=1&per_page=10
 * Requirements: prisma and calcLungAge already available in controller scope.
 * If controller is not in src/controllers, adjust the helper import path.
 * Authorization / patient access middleware on the original route MUST remain active.
 * One spirometry blow per indexed "session", newest first; all blows paginated.
 */
const getResults = async (req, res) => {
  // Shared with the clinician portal's Spirometry, Reports and Comparison tabs.
  // Do not duplicate demographic unit/GLI rules in this mobile controller.
  const patientRepository = require('../../repositories/patientRepository');
  const { bestObservedValues, createCalculatedValues, mobileGli,
    inspectDemographics } = require('../../helpers/spirometryParity');
  const { buildMobileBestResult } = require('../../services/mobileBestResult');

  try {
    const patientId = Number(req.params.patient_id);
    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    const parseInteger = (raw, fallback, max) => {
      if (raw == null || raw === '') return fallback;
      const parsed = Number(raw);
      if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) return null;
      return parsed;
    };

    const page = parseInteger(req.query.page, 1, 100000);
    const perPage = parseInteger(req.query.per_page ?? req.query.limit, 10, 50);
    if (page == null || perPage == null) {
      return res.status(400).json({ error: 'Invalid page or per_page (maximum 50)' });
    }
    const skip = (page - 1) * perPage;
    // Optional client offset, e.g. Pakistan UTC+05:00 -> 300.
    // Legacy URLs without this query param retain UTC calendar dates.
    const rawOffset = req.query.tz_offset_minutes;
    const offsetMinutes = rawOffset == null ? 0 : Number(rawOffset);
    if (!Number.isInteger(offsetMinutes) || offsetMinutes < -840 || offsetMinutes > 840) {
      return res.status(400).json({ error: 'Invalid tz_offset_minutes' });
    }

    // Date-only route parameters include the entire calendar day (UTC).
    // Explicit date-time boundaries remain supported for legacy clients.
    const parseBoundary = (raw, isEnd) => {
      if (typeof raw !== 'string' || !raw.trim()) return null;
      let text;
      try {
        text = decodeURIComponent(raw).trim().replace(' ', 'T');
      } catch {
        return null;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const parsed = new Date(`${text}T00:00:00.000Z`);
        if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
          return null;
        }
        if (isEnd) parsed.setUTCDate(parsed.getUTCDate() + 1);
        // Date-only calendar days should follow the mobile app's local offset.
        parsed.setUTCMinutes(parsed.getUTCMinutes() - offsetMinutes);
        return { value: parsed, exclusive: isEnd };
      }
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return null;
      const parsed = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text}Z`);
      return Number.isNaN(parsed.getTime()) ? null : { value: parsed, exclusive: false };
    };

    const from = parseBoundary(req.params.start_date, false);
    const to = parseBoundary(req.params.end_date, true);
    if (!from || !to) return res.status(400).json({ error: 'Invalid date format' });
    if (from.value > to.value || (to.exclusive && from.value >= to.value)) {
      return res.status(400).json({ error: 'start_date must be on or before end_date' });
    }

    const dateRange = {
      gte: from.value,
      [to.exclusive ? 'lt' : 'lte']: to.value,
    };

    // Enforce patient ownership or an assigned clinician/admin before exposing measurements.
    const { canReadPatient } = require('../../helpers/patientScope');
    if (!(await canReadPatient(req.user, patientId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const patient = await prisma.dc_users.findUnique({
      where: { user_id: patientId },
      include: { patient_details: { include: { attributes: true } } },
    });
    if (!patient?.patient_details) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // CRITICAL: filter by the actual spirometry test date, not observation date.
    const where = {
      dbdate: dateRange,
      observation: { is: { user_id: patientId } },
    };
    const [total, tests] = await prisma.$transaction([
      prisma.portal_spirometry.count({ where }),
      prisma.portal_spirometry.findMany({
        where,
        orderBy: [{ dbdate: 'desc' }, { id: 'desc' }],
        skip,
        take: perPage,
        include: {
          observation: { select: { id: true, height: true } },
          flows: { orderBy: { id: 'asc' } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    const pagination = {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1 && totalPages > 0,
    };

    // Web Spirometry tab calculates "Best" across all maneuvers in each
    // observation/session. Fetch every blow of the page's observations so
    // best_spirometries agrees with Web even when a session has many blows.
    // The per-blow spirometries object remains unchanged for Flutter.
    const observationIds = [...new Set(tests.map(t => t.observation_id)
      .filter(id => Number.isSafeInteger(id)))];
    const sessionRows = observationIds.length
      ? await prisma.portal_spirometry.findMany({
          where: { observation_id: { in: observationIds } },
          select: { id: true, observation_id: true, dbdate: true,
            fev1: true, fvc: true, pefr: true, fef2575: true, fev6: true },
        })
      : [];
    const rowsByObservation = new Map();
    for (const row of sessionRows) {
      if (!rowsByObservation.has(row.observation_id)) rowsByObservation.set(row.observation_id, []);
      rowsByObservation.get(row.observation_id).push(row);
    }

    const spirometries = {};
    const bestSpirometries = {};
    const lungAges = {};
    const profile = await patientRepository.findPatientProfile(patientId);
    const details = profile?.patient_details || patient.patient_details;
    const attrs = details?.attributes || {};

    const roundOrNull = (value) => {
      if (value == null || value === '') return null;
      const num = Number(value);
      return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
    };
    const noGli = () => ({ gli: { value: null, lln: null, zscore: null } });
    // The GLI result format must remain exactly as expected by the Flutter app.
    const gliResponse = (calculated) => mobileGli(calculated);

    tests.forEach((test, idx) => {
      // Same normalized values + same verified demographics as the web Spirometry tab.
      const testData = bestObservedValues([test]);
      const check = inspectDemographics({
        attributes: attrs,
        details,
        observationHeight: test.observation?.height,
        testDate: test.dbdate,
      });
      const demo = check.demo;
      const predicted = createCalculatedValues(testData, demo);
      const height = demo?.height ?? null;
      const gender = attrs.gender ?? null;
      const ratio = testData.fev1FvcRatio;
      const observedRatioPercent = ratio == null ? null : Number((ratio * 100).toFixed(1));

      const flows = { expiratory: [], inspiratory: [] };
      (test.flows || []).forEach((item, index, all) => {
        const flow = Number(item.value ?? 0);
        const point = {
          time: item.time != null ? Number(item.time) : Number(((index / Math.max(1, all.length)) * 2).toFixed(4)),
          flow,
          volume: Number(item.volume ?? 0),
        };
        (flow >= 0 ? flows.expiratory : flows.inspiratory).push(point);
      });

      const blow = {
        fev1: { observed: testData.fev1, predicted: gliResponse(predicted.fev1) },
        fvc: { observed: testData.fvc, predicted: gliResponse(predicted.fvc) },
        fev1fvc: { observed: observedRatioPercent, predicted: gliResponse(predicted.fev1fvc) },
        fef2575: { observed: testData.fef2575, predicted: gliResponse(predicted.fef2575) },
        // The supplied helper uses FEV1 equations for FEV6/PEFR; do not fabricate clinical reference values.
        fev6: { observed: testData.fev6, predicted: noGli() },
        pefr: { observed: testData.pefr, predicted: noGli() },
        fet: { observed: null, predicted: { gli: { value: null } } },
        id: test.id,
        flows,
        qualityMessage: test.quality_message == null ? 'Good Blow!' : String(test.quality_message),
        fev1Acceptability: test.fev1_acceptability ?? null,
        fvcAcceptability: test.fvc_acceptability ?? null,
      };
      // "Best" is session-level, matching Web's buildResultRows by observation.
      // Predicted and LLN depend on the latest blow's age within the session.
      const sessionTests = rowsByObservation.get(test.observation_id) || [test];
      const sessionBest = bestObservedValues(sessionTests);
      const latestSessionDate = sessionTests.reduce((latest, row) =>
        row.dbdate && (!latest || row.dbdate > latest) ? row.dbdate : latest,
        test.dbdate);
      const sessionDemo = inspectDemographics({
        attributes: attrs, details,
        observationHeight: test.observation?.height,
        testDate: latestSessionDate,
      }).demo;
      const sessionPredictions = createCalculatedValues(sessionBest, sessionDemo);
      spirometries[idx] = { [test.dbdate.toISOString()]: blow };
      // Do not omit best-result ratio, LLN, or z-scores.
      // This shared formatter maps the EXACT web calculated result fields to
      // Flutter's existing best_spirometries -> metric -> predicted.gli shape.
      bestSpirometries[idx] = buildMobileBestResult(sessionBest, sessionPredictions);

      if (typeof calcLungAge === 'function' && testData.fev1 > 0 && height) {
        try {
          const lungAge = Number(calcLungAge(testData.fev1, height, gender));
          if (Number.isFinite(lungAge)) lungAges[idx] = lungAge;
        } catch (e) {
          console.error('[LungAge]', e);
        }
      }
    });

    res.setHeader('Cache-Control', 'private, no-store');
    return sendLegacyFlutterResults(res, {
      spirometries: spirometries,
      best_spirometries: bestSpirometries,
      lung_ages: lungAges,
      pagination, // The existing response keys and nesting are preserved.
    });
  } catch (error) {
    console.error('[VitalFlo getResults paginated]', error);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
};

const getDaysOfSpirometry = async (req, res) => {
  try {
    const observations = await prisma.portal_observation.findMany({
      where: { user_id: parseInt(req.params.patient_id) },
      select: { dbdate: true },
      orderBy: { dbdate: "desc" },
    });
    const dates = [
      ...new Set(observations.map((o) => o.dbdate.toISOString().split("T")[0])),
    ];
    // Return wrapped object for consistency
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch days" });
  }
};

const syncPatient = async (req, res) => {
  try {
    const user = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(req.body.user_id) || undefined },
    });
    if (user)
      await prisma.dc_users.update({
        where: { user_id: user.user_id },
        data: {
          f_name: req.body.first_name || user.f_name,
          l_name: req.body.last_name || user.l_name,
        },
      });
    res.json({ synced: true, vitalport_id: req.body.user_id });
  } catch (error) {
    res.status(500).json({ error: "Sync failed" });
  }
};

module.exports = {
  syncSpirometry,
  syncSpirometryPlus,
  getSpirometryByUser,
  getPredictedValues,
  computeAlerts,
  submitPreSpiroSurvey,
  getPreSpiroSurvey,
  takeSurvey,
  getResults,
  getDaysOfSpirometry,
  syncPatient,
};