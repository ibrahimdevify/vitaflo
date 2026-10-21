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

    const parseBoundary = (raw, isEnd) => {
      if (typeof raw !== 'string') return null;
      let text;
      try {
        text = decodeURIComponent(raw).trim().replace(' ', 'T');
      } catch {
        return null;
      }

      // Date-only parameters: UTC calendar days, with an EXCLUSIVE
      // upper bound at the next midnight so the full final day is included.
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const date = new Date(`${text}T00:00:00.000Z`);
        if (
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== text
        ) return null;
        if (isEnd) date.setUTCDate(date.getUTCDate() + 1);
        return { date, exclusive: isEnd };
      }

      // Keep support for exact timestamps supplied by older clients.
      // A timezone-less timestamp is interpreted as UTC.
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return null;
      const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
        ? text
        : `${text}Z`;
      const date = new Date(withZone);
      return Number.isNaN(date.getTime())
        ? null
        : { date, exclusive: false };
    };

    const from = parseBoundary(req.params.start_date, false);
    const to = parseBoundary(req.params.end_date, true);

    if (!from || !to) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (from.date > to.date || (to.exclusive && from.date >= to.date)) {
      return res.status(400).json({ error: 'Invalid date range' });
    }

    const range = {
      gte: from.date,
      [to.exclusive ? 'lt' : 'lte']: to.date,
    };

    // Existing patient profile relationship is used for GLI demographics.
    const patient = await prisma.dc_users.findUnique({
      where: { user_id: patientId },
      include: {
        patient_details: { include: { attributes: true } },
        user_details: true,
      },
    });
    if (!patient?.patient_details) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // CRITICAL: Filter by the actual test's dbdate, not the parent
    // observation's dbdate. Return ONE newest blow, regardless of how many
    // separate observations exist on this day.
    const test = await prisma.portal_spirometry.findFirst({
      where: {
        dbdate: range,
        observation: { is: { user_id: patientId } },
      },
      orderBy: [
        { dbdate: 'desc' },
        { id: 'desc' },
      ],
      include: {
        observation: { select: { id: true, user_id: true, height: true } },
        flows: { orderBy: { id: 'asc' } },
      },
    });

    res.setHeader('Cache-Control', 'no-store');

    const emptyResponse = {
      spirometries: {},
      best_spirometries: {},
      lung_ages: {},
    };
    if (!test) return res.json(emptyResponse);

    const attrs = patient.patient_details.attributes || {};
    const details = patient.patient_details;
    const measurement = normalizeSpirometry(test);
    const timestamp = test.dbdate.toISOString();

    const finiteOrNull = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const number = Number(value);
      return Number.isFinite(number) ? Number(number.toFixed(2)) : null;
    };

    const ageOnTestDate = (dob, at) => {
      if (!dob) return null;
      const birth = new Date(dob);
      const date = new Date(at);
      if (Number.isNaN(birth.getTime()) || birth > date) return null;
      let age = date.getUTCFullYear() - birth.getUTCFullYear();
      if (
        date.getUTCMonth() < birth.getUTCMonth() ||
        (date.getUTCMonth() === birth.getUTCMonth() &&
          date.getUTCDate() < birth.getUTCDate())
      ) age -= 1;
      return age > 0 ? age : null;
    };

    const age = ageOnTestDate(attrs.dob || patient.user_details?.dob, test.dbdate);
    const rawHeight = [test.observation?.height, attrs.height, details.height]
      .map((v) => Number(v))
      .find((v) => Number.isFinite(v) && v > 0);
    const heightCm = rawHeight > 0 && rawHeight < 3 ? rawHeight * 100 : rawHeight;
    const gender = String(attrs.gender || '').trim();
    const validDemo =
      age !== null &&
      Number.isFinite(heightCm) && heightCm > 0 &&
      /^(male|female|m|f)$/i.test(gender);

    // Never silently invent age/height/sex for medical predictions.
    const demo = validDemo
      ? toGliDemographics({
          age,
          lookup_table: attrs.lookup_table,
          attributes: {
            height: heightCm,
            gender,
            lookup_table: attrs.lookup_table,
          },
          patient_details: { height: heightCm },
        })
      : null;

    const gliUnavailable = () => ({ gli: { value: null, lln: null, zscore: null } });
    const mapGli = (result) => ({
      gli: {
        value: finiteOrNull(result?.predicted),
        lln: finiteOrNull(result?.lln),
        zscore: finiteOrNull(result?.zScore),
      },
    });

    const predicted = (observed, variable) => {
      if (!demo || observed == null || observed <= 0) return gliUnavailable();
      try {
        return mapGli(calculatePredictedValues(observed, demo, variable));
      } catch (error) {
        console.error(`[VitalFlo GLI] ${variable} failed:`, error.message);
        return gliUnavailable();
      }
    };

    const ratio = measurement.fev1 != null && measurement.fvc > 0
      ? measurement.fev1 / measurement.fvc
      : null;
    const ratioPercent = ratio == null ? null : Number((ratio * 100).toFixed(1));
    let ratioPrediction = gliUnavailable();
    if (demo && ratio != null && ratio > 0) {
      try {
        ratioPrediction = mapGli(calculateFev1FvcPredictedValues(ratio, demo));
      } catch (error) {
        console.error('[VitalFlo GLI] FEV1/FVC failed:', error.message);
      }
    }

    const expiratory = [];
    const inspiratory = [];
    const flows = test.flows || [];
    flows.forEach((f, index) => {
      const flow = Number(f.value ?? 0);
      const point = {
        time: Number(f.time) > 0
          ? Number(f.time)
          : Number(((index / Math.max(1, flows.length)) * 2).toFixed(4)),
        flow,
        volume: Number(f.volume ?? 0),
      };
      if (flow >= 0) expiratory.push(point);
      else inspiratory.push(point);
    });

    const blow = {
      fev1: {
        observed: measurement.fev1,
        predicted: predicted(measurement.fev1, 'FEV1'),
      },
      fvc: {
        observed: measurement.fvc,
        predicted: predicted(measurement.fvc, 'FVC'),
      },
      fev1fvc: { observed: ratioPercent, predicted: ratioPrediction },
      fef2575: {
        observed: measurement.fef2575,
        predicted: predicted(measurement.fef2575, 'FEF2575'),
      },
      // The supplied helper incorrectly treats FEV6 and PEFR as FEV1 for
      // prediction. Keep response fields but do not present those as GLI values.
      fev6: { observed: measurement.fev6, predicted: gliUnavailable() },
      pefr: { observed: measurement.pefr, predicted: gliUnavailable() },
      fet: { observed: null, predicted: { gli: { value: null } } },
      id: test.id,
      flows: { expiratory, inspiratory },
      qualityMessage: test.quality_message == null
        ? 'Good Blow!'
        : String(test.quality_message),
      fev1Acceptability: test.fev1_acceptability ?? null,
      fvcAcceptability: test.fvc_acceptability ?? null,
    };

    const bestField = (key, includeLln) => ({
      observed: blow[key].observed,
      predicted: {
        gli: {
          value: blow[key].predicted.gli.value,
          ...(includeLln ? { lln: blow[key].predicted.gli.lln } : {}),
        },
      },
    });

    const best = {
      fev1: bestField('fev1', true),
      fvc: bestField('fvc', true),
      pefr: bestField('pefr', false),
      fef2575: bestField('fef2575', false),
      fev6: bestField('fev6', false),
    };

    const lungAges = {};
    if (
      measurement.fev1 != null && measurement.fev1 > 0 &&
      validDemo && typeof calcLungAge === 'function'
    ) {
      try {
        const lungAge = calcLungAge(measurement.fev1, heightCm, gender);
        if (Number.isFinite(Number(lungAge))) lungAges['0'] = Number(lungAge);
      } catch (error) {
        console.error('[VitalFlo] Lung age calculation failed:', error.message);
      }
    }

    // Exactly the same nesting and top-level keys as a one-blow Sept response.
    return res.json({
      spirometries: { '0': { [timestamp]: blow } },
      best_spirometries: { '0': best },
      lung_ages: lungAges,
    });
  } catch (error) {
    console.error('Get results error:', error);
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