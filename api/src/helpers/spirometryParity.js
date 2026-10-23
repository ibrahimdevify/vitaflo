'use strict';

// Shared by web spirometry tab and mobile getResults.
// Use this module instead of duplicating GLI prediction/demographics code.
const { normalizeSpirometryValue, normalizeDemo, normalizeHeightCm,
  toGliSex, toGliEthnicity, calculatePredictedValues,
  calculateFev1FvcPredictedValues } = require('./spirometry');

const empty = () => ({ predicted: null, lln: null, zScore: null, percentPredicted: null });
const round = (n, places = 2) => n == null ? null : Number(n.toFixed(places));

function ageAtDate(dob, testDate) {
  const birth = dob ? new Date(dob) : null;
  const date = testDate ? new Date(testDate) : null;
  if (!birth || !date || !Number.isFinite(birth.getTime()) ||
      !Number.isFinite(date.getTime()) || birth > date) return null;
  // Fractional years matter for GLI predictions, especially children/adolescents.
  const age = (date.getTime() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000);
  return age >= 3 && age <= 95 ? age : null;
}
function demographicsForTest({ attributes = {}, details = {}, observationHeight, testDate, dateOfBirth } = {}) {
  const candidates = [observationHeight, attributes.height, details.height];
  const height = candidates.map(normalizeHeightCm).find(h => h !== null) ?? null;
  return normalizeDemo({
    age: ageAtDate(dateOfBirth ?? attributes.dob ?? details.dob, testDate),
    height,
    sex: toGliSex(attributes.gender),
    ethnicity: toGliEthnicity(attributes.lookup_table),
  });
}
function predictedFor(observed, demo, variable) {
  if (!demo || observed == null || !Number.isFinite(observed) || observed <= 0) return empty();
  return calculatePredictedValues(observed, demo, variable);
}
function ratioPredictedFor(observedRatio, demo) {
  if (!demo || observedRatio == null || !Number.isFinite(observedRatio) || observedRatio <= 0) return empty();
  return calculateFev1FvcPredictedValues(observedRatio, demo);
}
function mobileGli(calculated) {
  return { gli: {
    value: round(calculated?.predicted),
    lln: round(calculated?.lln),
    zscore: round(calculated?.zScore),
  } };
}
function bestObservedValues(spirometries = []) {
  const fields = ['fev1', 'fvc', 'pefr', 'fef2575', 'fev6'];
  const best = {};
  for (const field of fields) {
    const vals = spirometries.map(sp => normalizeSpirometryValue(sp[field]))
      .filter(v => v !== null && Number.isFinite(v));
    best[field] = vals.length ? Math.max(...vals) : null;
  }
  best.fev1FvcRatio = best.fev1 != null && best.fvc > 0
    ? best.fev1 / best.fvc : null;
  return best;
}
function createCalculatedValues(measurements, demo) {
  const ratio = measurements.fev1FvcRatio ?? (
    measurements.fev1 != null && measurements.fvc > 0 ?
      measurements.fev1 / measurements.fvc : null);
  return {
    fev1: predictedFor(measurements.fev1, demo, 'FEV1'),
    fvc: predictedFor(measurements.fvc, demo, 'FVC'),
    fev1fvc: ratioPredictedFor(ratio, demo),
    fef2575: predictedFor(measurements.fef2575, demo, 'FEF2575'),
    // No GLI equations provided for PEFR/FEV6; do not mislabel FEV1 values.
    pefr: empty(), fev6: empty(),
  };
}
module.exports = { ageAtDate, demographicsForTest, predictedFor,
  ratioPredictedFor, mobileGli, bestObservedValues, createCalculatedValues, round };
