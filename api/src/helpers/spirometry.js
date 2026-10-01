// src/helpers/spirometry.js

/**
 * Spirometry helpers with GLI-2012 reference equations.
 * Package: @automate-medical/gli2012
 */

const RAW_SPIROMETRY_SCALE_FACTOR = 100;

/**
 * GLI-2012 reference package.
 * Uses dynamic import() because the package is ESM-only.
 */
let gliModule = null;
let gliLoadError = null;

const loadGliModule = async () => {
  if (gliModule) return gliModule;
  try {
    gliModule = await import('@automate-medical/gli2012');
    return gliModule;
  } catch (err) {
    gliLoadError = err;
    return null;
  }
};

/**
 * GLI-2012 ethnicity code → package string.
 * Package values: "Caucasian", "African-American", "NE Asian", "SE Asian", "Other"
 */
const toGliEthnicityName = (ethnicityCode) => {
  const map = {
    1: 'Caucasian',
    2: 'African-American',
    3: 'NE Asian',
    4: 'SE Asian',
    5: 'Other',
  };
  return map[ethnicityCode] || 'Other';
};

/**
 * GLI-2012 sex code → package string.
 */
const toGliSexName = (sexCode) => (sexCode === 1 ? 'Male' : 'Female');

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  return number;
};

const normalizeSpirometryValue = (rawValue) => {
  const value = toNumberOrNull(rawValue);
  if (value === null) return null;
  if (Math.abs(value) >= RAW_SPIROMETRY_SCALE_FACTOR / 5) {
    return Number((value / RAW_SPIROMETRY_SCALE_FACTOR).toFixed(2));
  }
  return Number(value.toFixed(2));
};

const mapSpirometryInput = (val = {}) => {
  const firstDefined = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return null;
  };
  return {
    fvc: firstDefined(val.fvcL, val.fvc),
    fev1: firstDefined(val.fev1L, val.fev1),
    pefr: firstDefined(val.pefLs, val.pefr),
    fef2575: firstDefined(val.fef2575Ls, val.fef2575),
    fev6: firstDefined(val.fev6L, val.fev6),
    fev1_perc: firstDefined(val.fev1Perc, val.fev1_perc),
    btps: firstDefined(val.btps),
    temp_celsius: firstDefined(val.tempCelsius, val.temp_celsius),
    quality_message: firstDefined(val.qualityMessage, val.quality_message),
  };
};

const toGliSex = (sexAtBirth) => {
  const s = String(sexAtBirth || '').trim().toLowerCase();
  if (s.startsWith('m')) return 1;
  if (s.startsWith('f')) return 2;
  return 1;
};

const toGliEthnicity = (ethnicGroup) => {
  const e = String(ethnicGroup || '').trim().toLowerCase();
  if (!e) return 5;
  if (e.includes('cauc') || e.includes('white')) return 1;
  if (e.includes('afr') || e.includes('black')) return 2;
  if (e.includes('ne asian') || e.includes('chinese') || e.includes('japan') || e.includes('korea')) return 3;
  if (e.includes('se asian') || e.includes('indian') || e.includes('filip') || e.includes('thai')) return 4;
  return 5;
};

const normalizeDemo = (demo = {}) => ({
  age: Number.isFinite(demo.age) && demo.age > 0 ? Number(demo.age) : 40,
  height: Number.isFinite(demo.height) && demo.height > 0 ? Number(demo.height) : 170,
  sex: demo.sex === 1 || demo.sex === 2 ? demo.sex : toGliSex(demo.sexAtBirth),
  ethnicity: demo.ethnicity >= 1 && demo.ethnicity <= 5 ? demo.ethnicity : toGliEthnicity(demo.ethnicity),
});

/**
 * Calculate GLI-2012 predicted values.
 * The package is async (ESM), so this function returns a Promise.
 */
const calculatePredictedValues = async (rawValue, demo = {}, variable = 'FEV1') => {
  const value = normalizeSpirometryValue(rawValue);

  if (value === null || value <= 0) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const gli = await loadGliModule();
  if (!gli) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const normalized = normalizeDemo(demo);

  try {
    const args = {
      age: normalized.age,
      sex: toGliSexName(normalized.sex),
      height: normalized.height,
      ethnicity: toGliEthnicityName(normalized.ethnicity),
      measured: value,
    };

    let result;
    if (variable === 'FEV1') result = gli.fev1(args);
    else if (variable === 'FVC') result = gli.fvc(args);
    else if (variable === 'FEV1FVC') result = gli.fev1fvc(args);
    else return { predicted: null, lln: null, zScore: null, percentPredicted: null };

    if (!result || !Number.isFinite(result.M)) {
      return { predicted: null, lln: null, zScore: null, percentPredicted: null };
    }

    return {
      predicted: Number(result.M.toFixed(2)),
      lln: Number(result.LLN.toFixed(2)),
      zScore: Number(result.zscore.toFixed(2)),
      percentPredicted: Number(result.percentage.toFixed(2)),
    };
  } catch (_err) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }
};

const calculateFev1FvcRatio = (fev1, fvc) => {
  const normalizedFev1 = normalizeSpirometryValue(fev1);
  const normalizedFvc = normalizeSpirometryValue(fvc);

  if (normalizedFev1 === null || normalizedFvc === null || normalizedFvc === 0) return null;

  return Number((normalizedFev1 / normalizedFvc).toFixed(2));
};

const calculateFev1FvcPredictedValues = async (fev1FvcRatioOrPercent, demo = {}) => {
  if (fev1FvcRatioOrPercent === null || fev1FvcRatioOrPercent === undefined) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const observedRatio = fev1FvcRatioOrPercent > 1.5 ? fev1FvcRatioOrPercent / 100 : fev1FvcRatioOrPercent;

  const gli = await loadGliModule();
  if (!gli) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const normalized = normalizeDemo(demo);

  try {
    const result = gli.fev1fvc({
      age: normalized.age,
      sex: toGliSexName(normalized.sex),
      height: normalized.height,
      ethnicity: toGliEthnicityName(normalized.ethnicity),
      measured: observedRatio,
    });

    if (!result || !Number.isFinite(result.M)) {
      return { predicted: null, lln: null, zScore: null, percentPredicted: null };
    }

    return {
      predicted: Number(result.M.toFixed(2)),
      lln: Number(result.LLN.toFixed(2)),
      zScore: Number(result.zscore.toFixed(2)),
      percentPredicted: Number(result.percentage.toFixed(2)),
    };
  } catch (_err) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }
};

const normalizeSpirometry = (sp = {}) => {
  const fev1 = normalizeSpirometryValue(sp.fev1);
  const fvc = normalizeSpirometryValue(sp.fvc);
  const pefr = normalizeSpirometryValue(sp.pefr);
  const fef2575 = normalizeSpirometryValue(sp.fef2575);
  const fev6 = normalizeSpirometryValue(sp.fev6);
  const fev1FvcRatio = calculateFev1FvcRatio(fev1, fvc);

  return { ...sp, fev1, fvc, pefr, fef2575, fev6, fev1_perc: toNumberOrNull(sp.fev1_perc), fev1_fvc_ratio: fev1FvcRatio };
};

const buildPredictedSpirometry = async (sp = {}, demo = {}) => {
  const normalized = normalizeSpirometry(sp);
  return {
    fev1: await calculatePredictedValues(normalized.fev1, demo, 'FEV1'),
    fvc: await calculatePredictedValues(normalized.fvc, demo, 'FVC'),
    fev1_fvc: await calculateFev1FvcPredictedValues(normalized.fev1_fvc_ratio, demo),
    fef2575: await calculatePredictedValues(normalized.fef2575, demo, 'FEF2575'),
    fev6: await calculatePredictedValues(normalized.fev6, demo, 'FEV1'),
    pefr: await calculatePredictedValues(normalized.pefr, demo, 'FEV1'),
  };
};

const pickBestSpirometry = (spirometries = []) => {
  const normalized = spirometries
    .map(normalizeSpirometry)
    .filter((sp) => sp.fev1 !== null || sp.fvc !== null || sp.pefr !== null || sp.fef2575 !== null || sp.fev6 !== null);

  if (!normalized.length) return null;

  return normalized.reduce((best, current) => {
    if (!best) return current;
    const bestFev1 = best.fev1 ?? -Infinity;
    const currentFev1 = current.fev1 ?? -Infinity;
    if (currentFev1 > bestFev1) return current;
    if (currentFev1 < bestFev1) return best;
    const bestFvc = best.fvc ?? -Infinity;
    const currentFvc = current.fvc ?? -Infinity;
    return currentFvc > bestFvc ? current : best;
  }, null);
};

const toGliDemographics = (profile) => {
  if (!profile) return { age: 40, height: 170, sex: 1, ethnicity: 5 };
  const attrs = profile.attributes || {};
  const details = profile.patient_details || {};
  return {
    age: Number.isFinite(profile.age) && profile.age > 0 ? profile.age : 40,
    height: attrs.height ?? details.height ?? 170,
    sex: toGliSex(attrs.gender || profile.sexAtBirth),
    ethnicity: toGliEthnicity(attrs.ethnic_group || profile.ethnicity),
  };
};

module.exports = {
  RAW_SPIROMETRY_SCALE_FACTOR,
  normalizeSpirometryValue,
  normalizeSpirometry,
  mapSpirometryInput,
  calculatePredictedValues,
  calculateFev1FvcRatio,
  calculateFev1FvcPredictedValues,
  buildPredictedSpirometry,
  pickBestSpirometry,
  toGliDemographics,
  toGliSex,
  toGliEthnicity,
};