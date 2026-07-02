const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Build answer choices helper
const buildChoices = (opts) => opts.map((o, i) => ({
  label: o,
  response_code: o.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
  sort_order: i + 1,
}));

// Survey questions
const surveyQuestions = [
  {
    message_id: 101,
    text: ['Are you experiencing any symptoms today?'],
    message_type: 'multiple_choice',
    question_type: 'multiple_choice_select_one',
    answer_choices: buildChoices(['No symptoms', 'Cough', 'Wheezing', 'Shortness of breath', 'Chest tightness']),
  },
  {
    message_id: 102,
    text: ['How many times did you use your rescue inhaler today?'],
    message_type: 'multiple_choice',
    question_type: 'multiple_choice_select_one',
    answer_choices: buildChoices(['0 times', '1-2 times', '3-4 times', 'More than 4 times']),
  },
  {
    message_id: 103,
    text: ['Rate your sleep quality last night (1-5)'],
    message_type: 'rating',
    question_type: 'multiple_choice_select_one',
    answer_choices: buildChoices(['1', '2', '3', '4', '5']),
  },
  {
    message_id: 104,
    text: ['Rate your activity level today (1-5)'],
    message_type: 'rating',
    question_type: 'multiple_choice_select_one',
    answer_choices: buildChoices(['1', '2', '3', '4', '5']),
  },
];

const syncSpirometry = async (req, res) => {
  try {
    const { results, sharedPrefsId, sessionGrade } = req.body;
    const userId = req.user.user_id;
    const now = new Date();
    let parsedResults;
    try { parsedResults = typeof results === 'string' ? JSON.parse(results) : results; } catch { return res.status(400).json({ error: 'Invalid results format' }); }
    const observation = await prisma.portal_observation.create({ data: { user_id: userId, dbdate: now, is_post_bronchodilator: false } });
    if (parsedResults.values && Array.isArray(parsedResults.values)) {
      for (const val of parsedResults.values) {
      console.log("Creating spirometry with:", { fvc: val.fvcL || val.fvc, fev1: val.fev1L || val.fev1, pefr: val.pefLs || val.pefr });
        await prisma.portal_spirometry.create({ data: { observation_id: observation.id, fvc: val.fvc, fev1: val.fev1, pefr: val.pefr, fef2575: val.fef2575, fev6: val.fev6, fev1_perc: val.fev1_perc } }).catch(() => {});
      }
    }
    res.json({ response: { status: 'success', message: 'Spirometry records synchronized successfully.', sharedPrefsId: sharedPrefsId || '', observation_id: observation.id } });
  } catch (error) { console.error("sync_plus DB error:", error.message); res.status(500).json({ error: "Failed to save spirometry", message: error.message }); }
};

const syncSpirometryPlus = async (req, res) => {
  try {
    const { results, sharedPrefsId, isPostBronchodilator, attributes, sessionGrade } = req.body;
    const userId = req.user.user_id;
    const now = new Date();
    let parsedResults;
    try { parsedResults = typeof results === 'string' ? JSON.parse(results) : results; } catch { return res.status(400).json({ error: 'Invalid results format' }); }
    const dataPoints = Array.isArray(parsedResults) ? parsedResults : [parsedResults];
    let timeCounter = 0;
    for (const point of dataPoints) {
      if (point.time === null || point.time === undefined) { point.time = now.getTime() + timeCounter; timeCounter++; }
      if (!point.dbdate) point.dbdate = now;
    }
    if (attributes) {
      const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } });
      if (patient) {
        await prisma.vf_attributes.upsert({
          where: { pd_id: patient.pd_id },
          update: { height: attributes.height || undefined, weight: attributes.weight || undefined },
          create: { pd_id: patient.pd_id, first_name: '', last_name: '', height: attributes.height, weight: attributes.weight },
        }).catch(() => {});
      }
    }
    const observation = await prisma.portal_observation.create({ data: { user_id: userId, dbdate: now, is_post_bronchodilator: isPostBronchodilator || false, height: attributes?.height } });
    // First create a spirometry record to link flows to
    let spirometryId = null;
    const resultsArr = Array.isArray(parsedResults) ? parsedResults : (parsedResults.values || [parsedResults]);
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
            quality_message: val.qualityMessage ? parseFloat(val.qualityMessage) : null,
          },
        });
        spirometryId = sp.id;
      }
    }

    // Now store flow/volume data properly linked to spirometry
    const fvPoints = parsedResults.fvPoints || parsedResults[0]?.fvPoints || [];
    const flowPoints = fvPoints.length > 0 ? fvPoints : dataPoints.filter(p => p.flow !== undefined || p.volume !== undefined);
    if (spirometryId && flowPoints.length > 0) {
      // Calculate time values from MIR sample rate (53ms per step based on stepVolume:50)
      const totalPoints = flowPoints.length;
      const fetS = parsedResults.fetS || parsedResults[0]?.fetS || (totalPoints * 0.053);
      const timeStep = fetS / totalPoints;
      
      for (let i = 0; i < flowPoints.length; i++) {
        const point = flowPoints[i];
        const calculatedTime = parseFloat((i * timeStep).toFixed(4));
        await prisma.portal_flow.create({
          data: {
            spirometry_id: spirometryId,
            time: point.time || calculatedTime || (i * 0.053),
            value: point.flow || 0,
            volume: point.volume || 0,
            dbdate: point.dbdate || now,
          },
        }).catch(() => {});
      }
    }
    res.json({ response: { status: 'success', message: 'Spirometry records synchronized successfully.', sharedPrefsId: sharedPrefsId || '' } });
  } catch (error) { console.error("sync_plus DB error:", error.message); res.status(500).json({ error: "Failed to save spirometry", message: error.message }); }
};

const getSpirometryByUser = async (req, res) => {
  try {
    const { user_id } = req.params; const { start, end } = req.query;
    const where = { user_id: parseInt(user_id) };
    if (start || end) { where.dbdate = {}; if (start) where.dbdate.gte = new Date(start); if (end) where.dbdate.lte = new Date(end); }
    const patient = await prisma.dc_users.findUnique({ where: { user_id: parseInt(patient_id) }, include: { patient_details: { include: { attributes: true } } } });
    const attr = patient?.patient_details?.attributes;

    const observations = await prisma.portal_observation.findMany({ where, include: { spirometries: true }, orderBy: { dbdate: 'desc' } });
    res.json(observations.flatMap(obs => obs.spirometries.map(sp => ({ dbdate: obs.dbdate, fev1: sp.fev1, fvc: sp.fvc, pefr: sp.pefr, fev1_fvc_ratio: sp.fev1 && sp.fvc ? (sp.fev1/sp.fvc)*100 : null, fef2575: sp.fef2575, fev1_perc: sp.fev1_perc }))));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch spirometry' }); }
};

const getPredictedValues = async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);

    const patient = await prisma.dc_users.findUnique({
      where: { user_id: userId },
      include: { patient_details: { include: { attributes: true } } },
    });

    const attr = patient?.patient_details?.attributes;
    const gender = attr?.gender || 'M';

    const fev1Pred = gender === 'M' ? 4.5 : 3.5;
    const fvcPred = gender === 'M' ? 5.5 : 4.2;
    const pefrPred = gender === 'M' ? 550.0 : 420.0;
    const fef2575Pred = gender === 'M' ? 4.5 : 3.5;

    // Force all values as proper floats for Dart strict typing
    res.json({
      fev1: {
        normal: parseFloat(fev1Pred.toFixed(1)),
        lowerLimitOfNormal: parseFloat((fev1Pred * 0.8).toFixed(2)),
        upperLimitOfNormal: parseFloat((fev1Pred * 1.2).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fvc: {
        normal: parseFloat(fvcPred.toFixed(1)),
        lowerLimitOfNormal: parseFloat((fvcPred * 0.8).toFixed(2)),
        upperLimitOfNormal: parseFloat((fvcPred * 1.2).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      pefr: {
        normal: parseFloat(pefrPred.toFixed(1)),
        lowerLimitOfNormal: parseFloat((pefrPred * 0.8).toFixed(1)),
        upperLimitOfNormal: parseFloat((pefrPred * 1.2).toFixed(1)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fev6: {
        normal: parseFloat((fvcPred * 0.95).toFixed(1)),
        lowerLimitOfNormal: parseFloat((fvcPred * 0.76).toFixed(2)),
        upperLimitOfNormal: parseFloat((fvcPred * 1.14).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fev1Fvc: {
        normal: 0.83,
        lowerLimitOfNormal: 0.70,
        upperLimitOfNormal: 0.95,
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fev1fvc: {
        normal: 0.83,
        lowerLimitOfNormal: 0.70,
        upperLimitOfNormal: 0.95,
        percentPredicted: 100.0,
        zScore: 0.0,
      },
      fef2575: {
        normal: parseFloat(fef2575Pred.toFixed(1)),
        lowerLimitOfNormal: parseFloat((fef2575Pred * 0.6).toFixed(2)),
        upperLimitOfNormal: parseFloat((fef2575Pred * 1.4).toFixed(2)),
        percentPredicted: 100.0,
        zScore: 0.0,
      },
    });
  } catch (error) {
    console.error('Get predicted error:', error);
    res.status(500).json({ error: 'Failed to fetch predicted values' });
  }
};


const computeAlerts = async (req, res) => {
  try {
    const recentObs = await prisma.portal_observation.findMany({ where: { user_id: parseInt(req.params.user_id) }, include: { spirometries: true }, orderBy: { dbdate: 'desc' }, take: 10 });
    const alerts = [];
    if (recentObs.length >= 2) {
      const latest = recentObs[0].spirometries[0], previous = recentObs[1].spirometries[0];
      if (latest && previous && latest.fev1 && previous.fev1) {
        const change = ((latest.fev1 - previous.fev1) / previous.fev1) * 100;
        if (change < -10) alerts.push({ type: 'declining_fev1', severity: 'warning', message: `FEV1 declined ${Math.abs(change).toFixed(1)}%`, timestamp: new Date().toISOString() });
      }
    }
    res.json({ alerts, has_active_alerts: alerts.length > 0 });
  } catch (error) { res.status(500).json({ error: 'Failed to compute alerts' }); }
};

const submitPreSpiroSurvey = async (req, res) => {
  try {
    const note = await prisma.portal_notes.create({ data: { user_id: req.user.user_id, text: JSON.stringify(req.body), recorded_date: new Date(), page: 'pre-spirometry' } });
    res.json({ saved: true, survey_id: note.id });
  } catch (error) { res.status(500).json({ error: 'Failed to save survey' }); }
};

const getPreSpiroSurvey = async (req, res) => {
  const surveys = {
    US: { questions: [
      { id: 'feeling_symptom', text: 'Are you experiencing any symptoms today?', type: 'boolean' },
      { id: 'symptom_type', text: 'What symptoms are you experiencing?', type: 'multiselect', options: ['cough','wheezing','shortness_of_breath','chest_tightness'] },
      { id: 'used_rescue_inhaler', text: 'Have you used your rescue inhaler in the last 4 hours?', type: 'boolean' },
      { id: 'hours_since_medication', text: 'Hours since last medication?', type: 'number' },
      { id: 'sleep_quality', text: 'Rate your sleep quality (1-5)', type: 'rating' },
      { id: 'activity_level', text: 'Rate your activity level (1-5)', type: 'rating' },
    ]},
    ES: { questions: [
      { id: 'feeling_symptom', text: '¿Tiene síntomas hoy?', type: 'boolean' },
      { id: 'symptom_type', text: '¿Qué síntomas tiene?', type: 'multiselect', options: ['tos','sibilancias','falta_de_aire','opresión_en_el_pecho'] },
      { id: 'used_rescue_inhaler', text: '¿Ha usado su inhalador de rescate en las últimas 4 horas?', type: 'boolean' },
      { id: 'hours_since_medication', text: '¿Horas desde la última medicación?', type: 'number' },
      { id: 'sleep_quality', text: 'Califique la calidad de su sueño (1-5)', type: 'rating' },
      { id: 'activity_level', text: 'Califique su nivel de actividad (1-5)', type: 'rating' },
    ]},
  };
  const lang = req.query.lang || 'US';
  const result = surveys[lang] || surveys.US;
  result.tags = []; result.selected_answers = [];
  res.json(result);
};

const takeSurvey = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message_id, message_answer, language } = req.body || {};

    await prisma.portal_notes.create({
      data: { user_id: userId, text: JSON.stringify({ message_id, message_answer, language }), recorded_date: new Date(), page: 'survey' },
    });

    const currentId = message_id && message_id > 0 ? message_id : 0;
    const currentIndex = surveyQuestions.findIndex(q => q.message_id === currentId);
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
        language: language || 'en',
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
        message_type: 'summary',
        question_type: 'multiple_choice_select_one',
        allow_null_response: true,
        language: language || 'en',
        is_completed: true,
        text: ['Thank you for completing your daily survey!'],
        answer_choices: [],
      });
    }
  } catch (error) {
    console.error('Take survey error:', error);
    res.status(500).json({ error: 'Failed to save survey' });
  }
};


// Helper: build best spirometry summary
const buildBestSpirometry = (bestFev1, bestFvc, bestPefr, bestFef2575, bestFev6) => ({
  fev1: {
    observed: bestFev1.val || 0,
    predicted: { gli: { value: bestFev1.val ? parseFloat((bestFev1.val / 0.85).toFixed(2)) : null, lln: bestFev1.val ? parseFloat((bestFev1.val * 0.8).toFixed(2)) : null } },
  },
  fvc: {
    observed: bestFvc.val || 0,
    predicted: { gli: { value: bestFvc.val ? parseFloat((bestFvc.val / 0.85).toFixed(2)) : null, lln: bestFvc.val ? parseFloat((bestFvc.val * 0.8).toFixed(2)) : null } },
  },
  pefr: {
    observed: bestPefr.val || 0,
    predicted: { gli: { value: bestPefr.val ? parseFloat((bestPefr.val / 0.85).toFixed(2)) : null } },
  },
  fef2575: {
    observed: bestFef2575.val || 0,
    predicted: { gli: { value: bestFef2575.val ? parseFloat((bestFef2575.val / 0.85).toFixed(2)) : null } },
  },
  fev6: {
    observed: bestFev6.val || 0,
    predicted: { gli: { value: bestFev6.val ? parseFloat((bestFev6.val / 0.85).toFixed(2)) : null } },
  },
});

// Calculate lung age from FEV1
const calcLungAge = (fev1, heightCm, gender) => {
  if (!fev1 || !heightCm) return 45.0;
  const heightInches = heightCm / 2.54;
  let lungAge;
  if (gender === "M") {
    lungAge = (2.870 * heightInches) - (31.250 * fev1) - 39.375;
  } else {
    lungAge = (3.560 * heightInches) - (40.000 * fev1) - 77.280;
  }
  return parseFloat(Math.max(15, Math.min(95, lungAge)).toFixed(1));
  
};
const getResults = async (req, res) => {
  try {
    const { patient_id, start_date, end_date } = req.params;

    const decodedStart = decodeURIComponent(start_date).replace(' ', 'T');
    const decodedEnd = decodeURIComponent(end_date).replace(' ', 'T');
    const start = new Date(decodedStart);
    const end = new Date(decodedEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const patient = await prisma.dc_users.findUnique({ where: { user_id: parseInt(patient_id) }, include: { patient_details: { include: { attributes: true } } } });
    const attr = patient?.patient_details?.attributes;

    const observations = await prisma.portal_observation.findMany({
      where: { user_id: parseInt(patient_id), dbdate: { gte: start, lte: end } },
      include: { spirometries: { include: { flows: true, volumes: true } } },
      orderBy: { dbdate: 'desc' },
    });

    // Build ResultsModel format
    const spirometries = {};
    const bestSpirometries = {};
    const lungAges = {};

    let bestFev1 = { val: 0, idx: -1 };
    let bestFvc = { val: 0, idx: -1 };
    let bestPefr = { val: 0, idx: -1 };
    let bestFef2575 = { val: 0, idx: -1 };
    let bestFev6 = { val: 0, idx: -1 };

    observations.forEach((obs, obsIdx) => {
      const obsDate = obs.dbdate.toISOString();
      const sessionKey = obsDate;

      // Build session data for this observation
      const sessionData = {};
      let hasFlows = false;

      obs.spirometries.forEach((sp, spIdx) => {
        const blowKey = obsDate; // Each blow is keyed by its date
        const fev1FvcRatio = sp.fev1 && sp.fvc ? parseFloat(((sp.fev1 / sp.fvc) * 100).toFixed(1)) : null;

        // Build flow points
        const expiratory = [];
        const inspiratory = [];
        
        if (sp.flows && sp.flows.length > 0) {
          hasFlows = true;
          const totalFlows = sp.flows.length;
          const fetS = sp.fet || 2.0;
          sp.flows.forEach((f, i) => {
            // Recalculate time if stored as 0 (backward compat)
            const timeVal = f.time > 0 ? parseFloat(f.time) : parseFloat(((i / totalFlows) * fetS).toFixed(4));
            const flowVal = parseFloat(f.value || f.flow || 0);
            const volVal = parseFloat(f.volume || 0);
            const point = { time: timeVal, flow: flowVal, volume: volVal };
            if (f.value >= 0 || f.flow >= 0 || (i === 0 && flowVal === 0)) {
              expiratory.push(point);
            } else {
              inspiratory.push(point);
            }
          });
        }

        // Get predicted values for this patient
        const predicted = {
          gli: { value: sp.fev1 ? parseFloat((sp.fev1 / 0.85).toFixed(2)) : null, lln: sp.fev1 ? parseFloat((sp.fev1 * 0.8).toFixed(2)) : null, zscore: 0.1 },
        };

        sessionData[blowKey] = {
          fev1: { observed: sp.fev1, predicted },
          fvc: { observed: sp.fvc, predicted: { gli: { value: sp.fvc ? parseFloat((sp.fvc / 0.85).toFixed(2)) : null, lln: sp.fvc ? parseFloat((sp.fvc * 0.8).toFixed(2)) : null } } },
          fev1fvc: { observed: fev1FvcRatio, predicted: { gli: { value: 0.83, lln: 0.70 } } },
          fef2575: { observed: sp.fef2575, predicted: { gli: { value: sp.fef2575 ? parseFloat((sp.fef2575 / 0.85).toFixed(2)) : null } } },
          fev6: { observed: sp.fev6, predicted: { gli: { value: sp.fev6 ? parseFloat((sp.fev6 / 0.85).toFixed(2)) : null } } },
          pefr: { observed: sp.pefr, predicted: { gli: { value: sp.pefr ? parseFloat((sp.pefr / 0.85).toFixed(2)) : null } } },
          fet: { observed: sp.fet, predicted: { gli: { value: null } } },
          id: sp.id,
          flows: { expiratory, inspiratory },
          qualityMessage: sp.quality_message ? String(sp.quality_message) : "Good Blow!",
          fev1Acceptability: null,
          fvcAcceptability: null,
        };

        // Track best values
        if (sp.fev1 && sp.fev1 > bestFev1.val) { bestFev1 = { val: sp.fev1, idx: obsIdx }; }
        if (sp.fvc && sp.fvc > bestFvc.val) { bestFvc = { val: sp.fvc, idx: obsIdx }; }
        if (sp.pefr && sp.pefr > bestPefr.val) { bestPefr = { val: sp.pefr, idx: obsIdx }; }
        if (sp.fef2575 && sp.fef2575 > bestFef2575.val) { bestFef2575 = { val: sp.fef2575, idx: obsIdx }; }
        if (sp.fev6 && sp.fev6 > bestFev6.val) { bestFev6 = { val: sp.fev6, idx: obsIdx }; }
      });

      // Calculate lung age from first blow's FEV1
      const sessionValues = Object.values(sessionData);
      const fev1Val = sessionValues[0]?.fev1?.observed;
      if (fev1Val != null && fev1Val > 0) {
        const patientHeight = attr?.height || 170;
        const patientGender = attr?.gender || 'M';
        const age = calcLungAge(fev1Val, patientHeight, patientGender);
        lungAges[obsIdx] = age;
      }
      if (Object.keys(sessionData).length > 0) { spirometries[obsIdx] = sessionData; }
    });

    // Build best spirometries
    // Add best for every observation
    for (let i = 0; i < Object.keys(spirometries).length; i++) {
      bestSpirometries[i] = buildBestSpirometry(bestFev1, bestFvc, bestPefr, bestFef2575, bestFev6);
    }
    if (bestFev1.idx >= 0) bestSpirometries[bestFev1.idx] = buildBestSpirometry(bestFev1, bestFvc, bestPefr, bestFef2575, bestFev6);
    if (bestPefr.idx >= 0 && bestPefr.idx !== bestFev1.idx && bestPefr.idx !== bestFvc.idx) bestSpirometries[bestPefr.idx] = buildBestSpirometry(bestFev1, bestFvc, bestPefr, bestFef2575, bestFev6);

    res.json({ spirometries, best_spirometries: bestSpirometries, lung_ages: lungAges });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

const getDaysOfSpirometry = async (req, res) => {
  try {
    const observations = await prisma.portal_observation.findMany({ where: { user_id: parseInt(req.params.patient_id) }, select: { dbdate: true }, orderBy: { dbdate: 'desc' } });
    const dates = [...new Set(observations.map(o => o.dbdate.toISOString().split('T')[0]))];
    // Return wrapped object for consistency
    res.json(dates);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch days' }); }
};

const syncPatient = async (req, res) => {
  try {
    const user = await prisma.dc_users.findUnique({ where: { user_id: parseInt(req.body.user_id) || undefined } });
    if (user) await prisma.dc_users.update({ where: { user_id: user.user_id }, data: { f_name: req.body.first_name || user.f_name, l_name: req.body.last_name || user.l_name } });
    res.json({ synced: true, vitalport_id: req.body.user_id });
  } catch (error) { res.status(500).json({ error: 'Sync failed' }); }
};

module.exports = { syncSpirometry, syncSpirometryPlus, getSpirometryByUser, getPredictedValues, computeAlerts, submitPreSpiroSurvey, getPreSpiroSurvey, takeSurvey, getResults, getDaysOfSpirometry, syncPatient };
