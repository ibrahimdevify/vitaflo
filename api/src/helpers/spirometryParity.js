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
// These optional environment variables MUST reflect verified database units.
// Leave at "auto" until the source data's unit is confirmed.
//   VITALFLO_OBSERVATION_HEIGHT_UNIT=inches_x100
//   VITALFLO_ATTRIBUTES_HEIGHT_UNIT=cm
//   VITALFLO_PATIENT_HEIGHT_UNIT=cm
const loggedDiagnostics = new Set();

function warnOnce(code, details = {}) {
  if (process.env.VITALFLO_GLI_DEBUG !== '1') return;
  const safe = { code, ...details };
  const key = JSON.stringify(safe);
  if (loggedDiagnostics.has(key)) return;
  loggedDiagnostics.add(key);
  // No name, DOB, patient ID or raw medical measurements in logs.
  console.warn('[VitalFlo GLI diagnostic]', safe);
}

/**
 * Non-throwing evaluation of candidate demographics. `issues` is for
 * local troubleshooting, never added to the existing API response.
 */
function inspectDemographics({ attributes = {}, details = {},
  observationHeight, testDate, dateOfBirth } = {}) {
  const specs = [
    { source: 'observation', raw: observationHeight,
      unit: process.env.VITALFLO_OBSERVATION_HEIGHT_UNIT || 'auto' },
    { source: 'attributes', raw: attributes.height,
      unit: process.env.VITALFLO_ATTRIBUTES_HEIGHT_UNIT || 'auto' },
    { source: 'patient_details', raw: details.height,
      unit: process.env.VITALFLO_PATIENT_HEIGHT_UNIT || 'auto' },
  ];
  const candidates = specs.map(s => ({ ...s,
    heightCm: normalizeHeightCm(s.raw, s.unit) }));
  const selected = candidates.find(c => c.heightCm !== null);
  const birth = dateOfBirth ?? attributes.dob ?? details.dob;
  const age = ageAtDate(birth, testDate);
  const sex = toGliSex(attributes.gender);
  const ethnicity = toGliEthnicity(attributes.lookup_table);

  const issues = [];
  if (age == null) issues.push('missing_or_invalid_dob_or_test_date');
  if (!selected) issues.push('missing_or_unsupported_height_unit');
  if (sex == null) issues.push('missing_or_unrecognised_gender');
  const demo = normalizeDemo({
    age, height: selected?.heightCm ?? null, sex, ethnicity,
  });
  if (!demo && issues.length === 0) issues.push('invalid_demographics');

  if (issues.length) {
    warnOnce('prediction_skipped', {
      issues,
      heightSources: candidates.map(c => ({
        source: c.source,
        present: c.raw !== null && c.raw !== undefined && c.raw !== '',
        unit: c.unit,
        accepted: c.heightCm !== null,
      })),
      dobPresent: birth !== null && birth !== undefined && birth !== '',
      genderPresent: attributes.gender != null && attributes.gender !== '',
    });
  }
  return {
    demo,
    issues,
    selectedHeightSource: selected?.source ?? null,
  };
}

function demographicsForTest(options = {}) {
  return inspectDemographics(options).demo;
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
  const result = {
    fev1: predictedFor(measurements.fev1, demo, 'FEV1'),
    fvc: predictedFor(measurements.fvc, demo, 'FVC'),
    fev1fvc: ratioPredictedFor(ratio, demo),
    fef2575: predictedFor(measurements.fef2575, demo, 'FEF2575'),
    // No GLI equations provided for PEFR/FEV6; do not mislabel FEV1 values.
    pefr: empty(), fev6: empty(),
  };
  if (demo) {
    for (const metric of ['fev1', 'fvc', 'fev1fvc', 'fef2575']) {
      if (result[metric].predicted === null) {
        warnOnce('coefficient_or_calculation_unavailable', { metric });
      }
    }
  }
  return result;
}

module.exports = { ageAtDate, demographicsForTest, inspectDemographics, predictedFor,
  ratioPredictedFor, mobileGli, bestObservedValues, createCalculatedValues, round };
