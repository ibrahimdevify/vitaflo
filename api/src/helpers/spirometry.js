'use strict';

const { calculateGli2012 } = require('./gli2012');
const RAW_SPIROMETRY_SCALE_FACTOR = 100;
const empty = () => ({ predicted: null, lln: null, zScore: null, percentPredicted: null });

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function normalizeSpirometryValue(rawValue) {
  const value = toNumberOrNull(rawValue);
  if (value === null) return null;
  // Existing historical raw readings are sometimes stored x100.
  // Preserve this legacy normalization for measured values, not chart points.
  if (Math.abs(value) >= RAW_SPIROMETRY_SCALE_FACTOR / 5) {
    return Number((value / RAW_SPIROMETRY_SCALE_FACTOR).toFixed(2));
  }
  return Number(value.toFixed(2));
}
function mapSpirometryInput(val = {}) {
  const firstDefined = (...values) => values.find(v => v !== undefined && v !== null && v !== '') ?? null;
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
}
function toGliSex(sexAtBirth) {
  const s = String(sexAtBirth ?? '').trim().toLowerCase();
  if (s === 'm' || s === 'male' || s === '1') return 1;
  if (s === 'f' || s === 'female' || s === '2') return 2;
  return null; // Never silently guess male for missing demographics.
}
function toGliEthnicity(lookupTable) {
  const v = String(lookupTable ?? '').trim().toLowerCase();
  if (v === 'caucasian' || v === '1') return 1;
  if (v === 'africanamerican' || v === '2') return 2;
  if (v === 'neasian' || v === '3') return 3;
  if (v === 'seasian' || v === '4') return 4;
  return 5; // Preserve existing "other / mixed" mapping.
}
/**
 * Normalise verified height units to centimetres.
 *
 * `auto` ONLY accepts unambiguous m (1.72) or cm (172).
 * A number such as 6580 may mean hundredths of inches OR another unit;
 * we deliberately require an explicit unit for that interpretation.
 */
function normalizeHeightCm(raw, unit = 'auto') {
  const height = toNumberOrNull(raw);
  if (height === null || height <= 0) return null;
  const u = String(unit || 'auto').trim().toLowerCase();
  let cm;
  switch (u) {
    case 'auto':
      cm = height >= 0.65 && height <= 2.30 ? height * 100 : height;
      break;
    case 'cm':
    case 'centimeters':
    case 'centimetres':
      cm = height;
      break;
    case 'm':
    case 'meter':
    case 'metre':
      cm = height * 100;
      break;
    case 'in':
    case 'inch':
    case 'inches':
      cm = height * 2.54;
      break;
    case 'in_x100':
    case 'inches_x100':
      cm = (height / 100) * 2.54;
      break;
    case 'cm_x100':
      cm = height / 100;
      break;
    default:
      return null; // Unknown units are not safe to interpret.
  }
  // Permit GLI reference's pediatric height range while rejecting
  // implausible values. This is a data validation bound, not a diagnosis.
  return Number.isFinite(cm) && cm >= 80 && cm <= 230 ? cm : null;
}

function normalizeDemo(demo = {}) {
  const age = toNumberOrNull(demo.age);
  const height = normalizeHeightCm(demo.height);
  const sex = demo.sex === 1 || demo.sex === 2 ? demo.sex : toGliSex(demo.sexAtBirth);
  const ethnicity = [1,2,3,4,5].includes(demo.ethnicity) ? demo.ethnicity : toGliEthnicity(demo.ethnicity);
  if (age === null || age < 3 || age > 95 || height === null || sex === null) return null;
  return { age, height, sex, ethnicity };
}
function toGliDemographics(profile) {
  if (!profile) return null;
  const attrs = profile.attributes || {};
  const details = profile.patient_details || {};
  return normalizeDemo({
    age: profile.age,
    height: attrs.height ?? details.height,
    sexAtBirth: attrs.gender ?? profile.sexAtBirth,
    ethnicity: toGliEthnicity(profile.lookup_table ?? attrs.lookup_table),
  });
}
function calculatePredictedValues(rawValue, demo = {}, variable = 'FEV1') {
  const value = normalizeSpirometryValue(rawValue);
  if (value === null || value <= 0) return empty();
  const normalized = normalizeDemo(demo);
  return normalized ? calculateGli2012(value, normalized, variable) : empty();
}
function calculateFev1FvcRatio(fev1, fvc) {
  const a = normalizeSpirometryValue(fev1);
  const b = normalizeSpirometryValue(fvc);
  return a == null || b == null || b === 0 ? null : Number((a / b).toFixed(2));
}
function calculateFev1FvcPredictedValues(ratioOrPercent, demo = {}) {
  const input = toNumberOrNull(ratioOrPercent);
  if (input === null) return empty();
  const ratio = input > 1.5 ? input / 100 : input;
  const normalized = normalizeDemo(demo);
  return normalized ? calculateGli2012(ratio, normalized, 'FEV1FVC') : empty();
}
function normalizeSpirometry(sp = {}) {
  const fev1 = normalizeSpirometryValue(sp.fev1);
  const fvc = normalizeSpirometryValue(sp.fvc);
  const pefr = normalizeSpirometryValue(sp.pefr);
  const fef2575 = normalizeSpirometryValue(sp.fef2575);
  const fev6 = normalizeSpirometryValue(sp.fev6);
  return { ...sp, fev1, fvc, pefr, fef2575, fev6,
    fev1_perc: toNumberOrNull(sp.fev1_perc),
    fev1_fvc_ratio: calculateFev1FvcRatio(fev1, fvc) };
}
function pickBestSpirometry(spirometries = []) {
  const valid = spirometries.map(normalizeSpirometry)
    .filter(sp => ['fev1','fvc','pefr','fef2575','fev6'].some(k => sp[k] != null));
  return valid.reduce((best, current) => {
    if (!best || current.fev1 > best.fev1) return current;
    if (current.fev1 < best.fev1) return best;
    return current.fvc > best.fvc ? current : best;
  }, null);
}
function buildPredictedSpirometry(sp = {}, demo = {}) {
  const n = normalizeSpirometry(sp);
  return {
    fev1: calculatePredictedValues(n.fev1, demo, 'FEV1'),
    fvc: calculatePredictedValues(n.fvc, demo, 'FVC'),
    fev1_fvc: calculateFev1FvcPredictedValues(n.fev1_fvc_ratio, demo),
    fef2575: calculatePredictedValues(n.fef2575, demo, 'FEF2575'),
    // GLI references for FEV6 and PEFR are not implemented in the provided coefficients.
    fev6: empty(),
    pefr: empty(),
  };
}
module.exports = { RAW_SPIROMETRY_SCALE_FACTOR, toNumberOrNull,
  normalizeSpirometryValue, normalizeSpirometry, mapSpirometryInput,
  calculatePredictedValues, calculateFev1FvcRatio,
  calculateFev1FvcPredictedValues, buildPredictedSpirometry,
  pickBestSpirometry, toGliDemographics, toGliSex, toGliEthnicity,
  normalizeHeightCm, normalizeDemo };
