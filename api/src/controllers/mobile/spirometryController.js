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

const getResults = async (req, res) => {
  const {
    normalizeSpirometry,
    calculatePredictedValues,
    calculateFev1FvcPredictedValues,
    toGliDemographics,
  } = require('../../helpers/spirometry');

  try {
    const { patient_id, start_date, end_date } = req.params;
    const patientId = Number(patient_id);

    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // Parse dates from the existing API route.
    const decode = (value) => {
      if (typeof value !== 'string' || !value.trim()) return '';
      try {
        return decodeURIComponent(value).trim().replace(' ', 'T');
      } catch {
        return '';
      }
    };

    const from = decode(start_date);
    const to = decode(end_date);
    const dayRegex = /^\d{4}-\d{2}-\d{2}$/;
    const startDay = from.slice(0, 10);
    const endDay = to.slice(0, 10);

    const validDay = (day) => {
      if (!dayRegex.test(day)) return false;
      const parsed = new Date(`${day}T00:00:00.000Z`);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === day
      );
    };

    if (!validDay(startDay) || !validDay(endDay)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const offset = (text) =>
      /(?:Z|[+-]\d{2}:?\d{2})$/i.exec(text)?.[0] || 'Z';

    const parseInput = (text) => {
      if (dayRegex.test(text)) {
        return new Date(`${text}T00:00:00.000Z`);
      }
      return new Date(
        /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text}Z`
      );
    };

    let start = parseInput(from);
    let end = parseInput(to);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Include the entire selected day.
    // Date-only values use UTC; explicit offsets are respected
    // for same-day requests.
    const atBoundary = (day, time, zone) =>
      new Date(`${day}T${time}${zone}`);

    if (startDay === endDay) {
      const zone = offset(from) !== 'Z' ? offset(from) : offset(to);
      start = atBoundary(startDay, '00:00:00.000', zone);
      end = atBoundary(endDay, '23:59:59.999', zone);
    } else {
      if (dayRegex.test(from)) {
        start = atBoundary(startDay, '00:00:00.000', 'Z');
      }
      if (dayRegex.test(to)) {
        end = atBoundary(endDay, '23:59:59.999', 'Z');
      }
    }

    if (start > end) {
      return res.status(400).json({
        error: 'start_date must not be after end_date',
      });
    }

    // Fetch patient demographics.
    const patient = await prisma.dc_users.findUnique({
      where: { user_id: patientId },
      include: {
        patient_details: {
          include: { attributes: true },
        },
      },
    });

    if (!patient?.patient_details) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const details = patient.patient_details;
    const attrs = details.attributes || {};

    // Find observations by observation date OR actual test date.
    const dateRange = { gte: start, lte: end };

    const observations = await prisma.portal_observation.findMany({
      where: {
        user_id: patientId,
        OR: [
          { dbdate: dateRange },
          {
            spirometries: {
              some: { dbdate: dateRange },
            },
          },
        ],
      },
      include: {
        spirometries: {
          orderBy: [
            { dbdate: 'desc' },
            { id: 'desc' },
          ],
          include: {
            flows: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
      orderBy: [
        { dbdate: 'desc' },
        { id: 'desc' },
      ],
    });

    const inRange = (value) => {
      const ms = value ? new Date(value).getTime() : NaN;
      return (
        Number.isFinite(ms) &&
        ms >= start.getTime() &&
        ms <= end.getTime()
      );
    };

    // Keep only tests within the requested date range.
    // Sort latest first.
    const sessions = observations
      .map((observation) => {
        const tests = (observation.spirometries || [])
          .filter((sp) => inRange(sp.dbdate || observation.dbdate))
          .sort(
            (a, b) =>
              new Date(b.dbdate) - new Date(a.dbdate) ||
              b.id - a.id
          );

        return {
          observation,
          tests,
          latest: tests.length
            ? new Date(tests[0].dbdate).getTime()
            : -Infinity,
        };
      })
      .filter(({ tests }) => tests.length > 0)
      .sort(
        (a, b) =>
          b.latest - a.latest ||
          b.observation.id - a.observation.id
      );

    // Existing response structure.
    const spirometries = {};
    const bestSpirometries = {};
    const lungAges = {};

    const asNumber = (value, precision = 2) => {
      if (value == null || value === '') return null;
      const n = Number(value);
      return Number.isFinite(n)
        ? Number(n.toFixed(precision))
        : null;
    };

    const unavailable = {
      predicted: null,
      lln: null,
      zScore: null,
    };

    // Map GLI helper output to the existing response format.
    const fullGli = (calculated) => ({
      gli: {
        value: asNumber(calculated?.predicted),
        lln: asNumber(calculated?.lln),
        zscore: asNumber(calculated?.zScore),
      },
    });

    const runGli = (fn, name) => {
      try {
        return fn();
      } catch (error) {
        console.error(
          `[VitalFlo GLI2012] ${name}:`,
          error.message
        );
        return unavailable;
      }
    };

    // Calculate actual patient age at the time of the test.
    const ageAt = (birthValue, testDate) => {
      if (!birthValue) return null;

      const birth = new Date(birthValue);
      const test = new Date(testDate);

      if (
        Number.isNaN(birth.getTime()) ||
        Number.isNaN(test.getTime()) ||
        birth > test
      ) {
        return null;
      }

      let age =
        test.getUTCFullYear() - birth.getUTCFullYear();

      if (
        test.getUTCMonth() < birth.getUTCMonth() ||
        (
          test.getUTCMonth() === birth.getUTCMonth() &&
          test.getUTCDate() < birth.getUTCDate()
        )
      ) {
        age--;
      }

      return age > 0 ? age : null;
    };

    // Prepare demographics using supplied spirometry helper.
    const buildDemo = (observation, testDate) => {
      const height = [
        observation.height,
        attrs.height,
        details.height,
      ]
        .map(Number)
        .find((v) => Number.isFinite(v) && v > 0);

      const age = ageAt(attrs.dob, testDate);
      const gender = String(attrs.gender || '').trim();

      // Do not silently use fabricated demographics for
      // clinical predictions.
      if (!age || !height || !/^(m|f)/i.test(gender)) {
        return null;
      }

      return toGliDemographics({
        age,
        lookup_table: attrs.lookup_table,
        attributes: {
          height,
          gender,
          lookup_table: attrs.lookup_table,
        },
        patient_details: { height },
      });
    };

    const predictedFor = (value, demo, variable) => {
      if (!demo || value == null || value <= 0) {
        return fullGli(unavailable);
      }

      return fullGli(
        runGli(
          () => calculatePredictedValues(value, demo, variable),
          variable
        )
      );
    };

    const ratioPredicted = (ratio, demo) => {
      if (!demo || ratio == null || ratio <= 0) {
        return fullGli(unavailable);
      }

      return fullGli(
        runGli(
          () => calculateFev1FvcPredictedValues(ratio, demo),
          'FEV1FVC'
        )
      );
    };

    // GLI-2012 FEV1 prediction must not be substituted
    // for FEV6 or PEFR.
    const noGli = () => fullGli(unavailable);

    sessions.forEach(({ observation, tests }, sessionIndex) => {
      const sessionData = {};
      const usedKeys = new Set();
      const normalizedTests = [];

      tests.forEach((raw) => {
        // Normalize the stored measurements.
        const sp = normalizeSpirometry(raw);
        const testDate = raw.dbdate || observation.dbdate;
        const demo = buildDemo(observation, testDate);

        normalizedTests.push({ sp, demo });

        // Unique timestamp key for every blow.
        let ms = new Date(testDate).getTime();

        if (!Number.isFinite(ms)) {
          ms = new Date(observation.dbdate).getTime();
        }

        let blowKey = new Date(ms).toISOString();

        while (usedKeys.has(blowKey)) {
          blowKey = new Date(++ms).toISOString();
        }

        usedKeys.add(blowKey);

        // Observed FEV1/FVC is returned as a percentage,
        // preserving the mobile application's existing format.
        const ratio =
          sp.fev1 != null &&
          sp.fvc != null &&
          sp.fvc > 0
            ? sp.fev1 / sp.fvc
            : null;

        const ratioPercent =
          ratio == null ? null : asNumber(ratio * 100, 1);

        // Build Flow/Volume points.
        const expiratory = [];
        const inspiratory = [];
        const flows = raw.flows || [];

        const timeFallback = 2.0;

        flows.forEach((f, i) => {
          const point = {
            time: Number(f.time) > 0
              ? Number(f.time)
              : asNumber(
                  (i / Math.max(1, flows.length)) *
                    timeFallback,
                  4
                ),
            flow: Number(f.value ?? 0),
            volume: Number(f.volume ?? 0),
          };

          if (point.flow >= 0) {
            expiratory.push(point);
          } else {
            inspiratory.push(point);
          }
        });

        // Same response keys, now with GLI-2012 calculations.
        sessionData[blowKey] = {
          fev1: {
            observed: sp.fev1,
            predicted: predictedFor(
              sp.fev1,
              demo,
              'FEV1'
            ),
          },

          fvc: {
            observed: sp.fvc,
            predicted: predictedFor(
              sp.fvc,
              demo,
              'FVC'
            ),
          },

          fev1fvc: {
            observed: ratioPercent,
            predicted: ratioPredicted(ratio, demo),
          },

          fef2575: {
            observed: sp.fef2575,
            predicted: predictedFor(
              sp.fef2575,
              demo,
              'FEF2575'
            ),
          },

          fev6: {
            observed: sp.fev6,
            predicted: noGli(),
          },

          pefr: {
            observed: sp.pefr,
            predicted: noGli(),
          },

          fet: {
            observed: null,
            predicted: {
              gli: { value: null },
            },
          },

          id: raw.id,

          flows: {
            expiratory,
            inspiratory,
          },

          qualityMessage:
            raw.quality_message != null
              ? String(raw.quality_message)
              : 'Good Blow!',

          fev1Acceptability:
            raw.fev1_acceptability ?? null,

          fvcAcceptability:
            raw.fvc_acceptability ?? null,
        };
      });

      if (!normalizedTests.length) return;

      spirometries[sessionIndex] = sessionData;

      // Calculate best values for THIS observation.
      const best = (field) => {
        const values = normalizedTests.map(
          ({ sp }) => sp[field]
        );

        const valid = values.filter(
          (n) => n != null && Number.isFinite(n)
        );

        return valid.length ? Math.max(...valid) : null;
      };

      const demo = normalizedTests[0].demo;

      const bestFev1 = best('fev1');
      const bestFvc = best('fvc');
      const bestPefr = best('pefr');
      const bestFef2575 = best('fef2575');
      const bestFev6 = best('fev6');

      // Preserve the best_spirometries field structure.
      const bestFields = (value, calculated, withLln) => ({
        observed: value,
        predicted: {
          gli: withLln
            ? {
                value: calculated.gli.value,
                lln: calculated.gli.lln,
              }
            : {
                value: calculated.gli.value,
              },
        },
      });

      bestSpirometries[sessionIndex] = {
        fev1: bestFields(
          bestFev1,
          predictedFor(bestFev1, demo, 'FEV1'),
          true
        ),

        fvc: bestFields(
          bestFvc,
          predictedFor(bestFvc, demo, 'FVC'),
          true
        ),

        pefr: bestFields(
          bestPefr,
          noGli(),
          false
        ),

        fef2575: bestFields(
          bestFef2575,
          predictedFor(bestFef2575, demo, 'FEF2575'),
          false
        ),

        fev6: bestFields(
          bestFev6,
          noGli(),
          false
        ),
      };

      // Keep your existing lung-age calculation.
      const latest = normalizedTests[0].sp;

      if (latest.fev1 != null && latest.fev1 > 0) {
        try {
          const height = [
            observation.height,
            attrs.height,
            details.height,
          ]
            .map(Number)
            .find(
              (v) => Number.isFinite(v) && v > 0
            ) || 170;

          const lungAge = calcLungAge(
            latest.fev1,
            height,
            attrs.gender || 'M'
          );

          if (Number.isFinite(Number(lungAge))) {
            lungAges[sessionIndex] = lungAge;
          }
        } catch (error) {
          console.error(
            '[VitalFlo lung age]',
            error.message
          );
        }
      }
    });

    res.setHeader('Cache-Control', 'no-store');

    return res.json({
      spirometries,
      best_spirometries: bestSpirometries,
      lung_ages: lungAges,
    });
  } catch (error) {
    console.error('Get results error:', error);

    return res.status(500).json({
      error: 'Failed to fetch results',
    });
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