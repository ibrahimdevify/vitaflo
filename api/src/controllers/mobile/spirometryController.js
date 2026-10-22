const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

const getSpirometryByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { start, end } = req.query;
    const where = { user_id: parseInt(user_id) };
    if (start || end) {
      where.dbdate = {};
      if (start) where.dbdate.gte = new Date(start);
      if (end) where.dbdate.lte = new Date(end);
    }
    // FIX: this previously referenced `patient_id`, which is never defined
    // in this function's scope (only `user_id` is destructured from
    // req.params) — every call to this endpoint threw a ReferenceError
    // before it ever reached the actual query below.
    const patient = await prisma.dc_users.findFirst({
      where: { user_id: parseInt(user_id) },
      include: { patient_details: { include: { attributes: true } } },
    });
    const attr = patient?.patient_details?.attributes;

    const observations = await prisma.portal_observation.findMany({
      where,
      include: { spirometries: true },
      orderBy: { dbdate: "desc" },
    });
    // Response shape unchanged: same fields as before.
    res.json(
      observations.flatMap((obs) =>
        obs.spirometries.map((sp) => ({
          dbdate: obs.dbdate,
          fev1: sp.fev1,
          fvc: sp.fvc,
          pefr: sp.pefr,
          fev1_fvc_ratio: sp.fev1 && sp.fvc ? (sp.fev1 / sp.fvc) * 100 : null,
          fef2575: sp.fef2575,
          fev1_perc: sp.fev1_perc,
        })),
      ),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch spirometry" });
  }
};

// FIX: this previously returned entirely hardcoded, gender-based guesses and
// never touched the database. The migration populated real GLI predicted
// values (portal_predicted_value) for every historical spirometry test, so
// this now reads the patient's actual most recent predicted values for
// fev1 / fvc / fev1fvc / fef2575 from that table, and only falls back to
// the old hardcoded estimate for a variable if no real row exists yet
// (e.g. a brand-new patient with no spirometry history). The JSON response
// shape/keys are UNCHANGED from the original — including the duplicated
// `fev1Fvc` / `fev1fvc` keys, since some existing client code may rely on
// either casing.
//
// NOTE: `pefr` and `fev6` are NOT covered by portal_predicted_value (the
// source system's GLI export only ever computed fev1, fvc, fev1fvc, and
// fef2575 — see 08_predicted_values.js from the migration). Those two
// still use the original hardcoded gender-based estimate, since there is
// no real predicted data to fall back on. Flagging this so it doesn't get
// mistaken for a real predicted value later.
const getPredictedValues = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    const patient = await prisma.dc_users.findFirst({
      where: { user_id: userId },
      include: { patient_details: { include: { attributes: true } } },
    });

    const attr = patient?.patient_details?.attributes;
    const gender = attr?.gender || "M";

    const fev1Pred = gender === "M" ? 4.5 : 3.5;
    const fvcPred = gender === "M" ? 5.5 : 4.2;
    const pefrPred = gender === "M" ? 550.0 : 420.0;
    const fef2575Pred = gender === "M" ? 4.5 : 3.5;

    // Pull real predicted values for this patient, most recent per variable.
    const predictedRows = await prisma.portal_predicted_value.findMany({
      where: {
        user_id: userId,
        variable: { in: ["fev1", "fvc", "fev1fvc", "fef2575"] },
      },
      orderBy: { created: "desc" },
    });
    const latestByVariable = {};
    for (const row of predictedRows) {
      if (!latestByVariable[row.variable]) latestByVariable[row.variable] = row;
    }

    const toResponseShape = (row, fallbackNormal, lowFactor, highFactor) => {
      if (row) {
        return {
          normal: row.predicted != null ? parseFloat(row.predicted.toFixed(2)) : null,
          lowerLimitOfNormal: row.lln != null ? parseFloat(row.lln.toFixed(2)) : null,
          upperLimitOfNormal: row.uln != null ? parseFloat(row.uln.toFixed(2)) : null,
          percentPredicted:
            row.percent_predicted != null ? parseFloat(row.percent_predicted.toFixed(1)) : 100.0,
          zScore: row.z_score != null ? parseFloat(row.z_score.toFixed(2)) : 0.0,
        };
      }
      // Fallback to the original hardcoded estimate when no real data exists yet.
      return {
        normal: parseFloat(fallbackNormal.toFixed(1)),
        lowerLimitOfNormal: parseFloat((fallbackNormal * lowFactor).toFixed(2)),
        upperLimitOfNormal: parseFloat((fallbackNormal * highFactor).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      };
    };

    const fev1fvcShape = toResponseShape(latestByVariable.fev1fvc, 0.83, 0.84, 1.14);

    // Force all values as proper floats for Dart strict typing
    res.json({
      fev1: toResponseShape(latestByVariable.fev1, fev1Pred, 0.8, 1.2),
      fvc: toResponseShape(latestByVariable.fvc, fvcPred, 0.8, 1.2),
      // No source data for pefr — unchanged hardcoded estimate.
      pefr: {
        normal: parseFloat(pefrPred.toFixed(1)),
        lowerLimitOfNormal: parseFloat((pefrPred * 0.8).toFixed(1)),
        upperLimitOfNormal: parseFloat((pefrPred * 1.2).toFixed(1)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      // No source data for fev6 — unchanged hardcoded estimate.
      fev6: {
        normal: parseFloat((fvcPred * 0.95).toFixed(1)),
        lowerLimitOfNormal: parseFloat((fvcPred * 0.76).toFixed(2)),
        upperLimitOfNormal: parseFloat((fvcPred * 1.14).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fev1Fvc: fev1fvcShape,
      fev1fvc: fev1fvcShape,
      fef2575: toResponseShape(latestByVariable.fef2575, fef2575Pred, 0.6, 1.4),
    });
  } catch (error) {
    console.error("Get predicted error:", error);
    res.status(500).json({ error: "Failed to fetch predicted values" });
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

// Helper: build best spirometry summary
const buildBestSpirometry = (
  bestFev1,
  bestFvc,
  bestPefr,
  bestFef2575,
  bestFev6,
) => ({
  fev1: {
    observed: bestFev1.val || 0,
    predicted: {
      gli: {
        value: bestFev1.val
          ? parseFloat((bestFev1.val / 0.85).toFixed(2))
          : null,
        lln: bestFev1.val ? parseFloat((bestFev1.val * 0.8).toFixed(2)) : null,
      },
    },
  },
  fvc: {
    observed: bestFvc.val || 0,
    predicted: {
      gli: {
        value: bestFvc.val ? parseFloat((bestFvc.val / 0.85).toFixed(2)) : null,
        lln: bestFvc.val ? parseFloat((bestFvc.val * 0.8).toFixed(2)) : null,
      },
    },
  },
  pefr: {
    observed: bestPefr.val || 0,
    predicted: {
      gli: {
        value: bestPefr.val
          ? parseFloat((bestPefr.val / 0.85).toFixed(2))
          : null,
      },
    },
  },
  fef2575: {
    observed: bestFef2575.val || 0,
    predicted: {
      gli: {
        value: bestFef2575.val
          ? parseFloat((bestFef2575.val / 0.85).toFixed(2))
          : null,
      },
    },
  },
  fev6: {
    observed: bestFev6.val || 0,
    predicted: {
      gli: {
        value: bestFev6.val
          ? parseFloat((bestFev6.val / 0.85).toFixed(2))
          : null,
      },
    },
  },
});

// Calculate lung age from FEV1
const calcLungAge = (fev1, heightCm, gender) => {
  if (!fev1 || !heightCm) return 45.0;
  const heightInches = heightCm / 2.54;
  let lungAge;
  if (gender === "M") {
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
const getResults = async (req, res) => {
  const {
    normalizeSpirometry,
    calculatePredictedValues,
    calculateFev1FvcPredictedValues,
    toGliDemographics,
  } = require('../../helpers/spirometry');

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

    // The route's existing authentication + authorization must check this patientId.
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

    const spirometries = {};
    const bestSpirometries = {};
    const lungAges = {};
    const attrs = patient.patient_details.attributes || {};

    const roundOrNull = (value) => {
      if (value == null || value === '') return null;
      const num = Number(value);
      return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
    };
    const noGli = () => ({ gli: { value: null, lln: null, zscore: null } });
    const ageOnDate = (dob, at) => {
      if (!dob) return null;
      const birth = new Date(dob);
      const date = new Date(at);
      if (Number.isNaN(birth.getTime()) || birth > date) return null;
      let age = date.getUTCFullYear() - birth.getUTCFullYear();
      if (date.getUTCMonth() < birth.getUTCMonth() ||
          (date.getUTCMonth() === birth.getUTCMonth() && date.getUTCDate() < birth.getUTCDate())) {
        age--;
      }
      return age > 0 ? age : null;
    };

    const demoForTest = (test) => {
      const age = ageOnDate(attrs.dob, test.dbdate);
      const rawHeight = [test.observation?.height, attrs.height]
        .map((v) => v == null ? NaN : Number(v))
        .find((v) => Number.isFinite(v) && v > 0);
      const height = rawHeight > 0 && rawHeight < 3 ? rawHeight * 100 : rawHeight;
      const gender = String(attrs.gender || '').trim();
      if (!age || !Number.isFinite(height) || height <= 0 || !/^(male|female|m|f)$/i.test(gender)) {
        return { demo: null, height: null, gender };
      }
      return {
        demo: toGliDemographics({
          age,
          lookup_table: attrs.lookup_table,
          attributes: { height, gender, lookup_table: attrs.lookup_table },
          patient_details: { height },
        }),
        height,
        gender,
      };
    };

    const gliResponse = (result) => ({
      gli: {
        value: roundOrNull(result?.predicted),
        lln: roundOrNull(result?.lln),
        zscore: roundOrNull(result?.zScore),
      },
    });
    const predict = (observed, demo, variable) => {
      if (!demo || observed == null || observed <= 0) return noGli();
      try {
        return gliResponse(calculatePredictedValues(observed, demo, variable));
      } catch (e) {
        console.error(`[GLI] ${variable}:`, e);
        return noGli();
      }
    };
    const predictRatio = (observed, demo) => {
      if (!demo || observed == null || observed <= 0) return noGli();
      try {
        return gliResponse(calculateFev1FvcPredictedValues(observed, demo));
      } catch (e) {
        console.error('[GLI] FEV1FVC:', e);
        return noGli();
      }
    };

    tests.forEach((test, idx) => {
      const testData = normalizeSpirometry(test);
      const { demo, height, gender } = demoForTest(test);
      const ratio = testData.fvc > 0 && testData.fev1 != null
        ? testData.fev1 / testData.fvc : null;
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
        fev1: { observed: testData.fev1, predicted: predict(testData.fev1, demo, 'FEV1') },
        fvc: { observed: testData.fvc, predicted: predict(testData.fvc, demo, 'FVC') },
        fev1fvc: { observed: observedRatioPercent, predicted: predictRatio(ratio, demo) },
        fef2575: { observed: testData.fef2575, predicted: predict(testData.fef2575, demo, 'FEF2575') },
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
      const best = (field, includeLln = false) => ({
        observed: blow[field].observed,
        predicted: {
          gli: {
            value: blow[field].predicted.gli.value,
            ...(includeLln ? { lln: blow[field].predicted.gli.lln } : {}),
          },
        },
      });
      spirometries[idx] = { [test.dbdate.toISOString()]: blow };
      bestSpirometries[idx] = {
        fev1: best('fev1', true),
        fvc: best('fvc', true),
        pefr: best('pefr'),
        fef2575: best('fef2575'),
        fev6: best('fev6'),
      };

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
    return res.json({
      spirometries: spirometries,
      best_spirometries: bestSpirometries,
      lung_ages: lungAges,
      pagination, // addition; original result fields and nesting are unchanged
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