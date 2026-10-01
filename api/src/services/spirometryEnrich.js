// src/services/spirometryEnrich.js
'use strict';

const {
  calculateGli2012,
  normalizeSpirometryValue,
} = require('../helpers/gli2012');

/**
 * Build GLI-2012 demographics from the observation and patient attributes,
 * matching Django's rules exactly:
 *   - height: observation.height first, then attributes.height
 *   - age:    currentYear - birthYear (integer, no birthday correction)
 *   - sex:    'F' → female, anything else → male
 *   - ethnicity: from lookup_table
 */
function buildDemographics({ observation, attributes }) {
  const attrs = attributes || {};
  const obsHeight = observation && observation.height;

  const height = Number(obsHeight) > 0
    ? Number(obsHeight)
    : (Number(attrs.height) > 0 ? Number(attrs.height) : 170);

  const dobYear = attrs.dob ? new Date(attrs.dob).getFullYear() : null;
  const age = dobYear ? (new Date().getFullYear() - dobYear) : 40;

  const sex = String(attrs.gender || '').toUpperCase() === 'F' ? 2 : 1;

  const ethMap = {
    Caucasian: 1,
    AfricanAmerican: 2,
    NEAsian: 3,
    SEAsian: 4,
  };
  const ethnicity = ethMap[attrs.lookup_table] || 5;

  return { age, height, sex, ethnicity };
}

/**
 * Enrich a single raw portal_spirometry row into the shape that
 * buildSpirometryReportHtml() expects.
 *
 * All returned keys are snake_case to match the HTML template exactly.
 */
function enrichSpirometry(raw, demographics) {
  if (!raw) return null;

  const demo = demographics || { age: 40, height: 170, sex: 1, ethnicity: 5 };

  // Normalize ×100 → real liters
  const fev1 = normalizeSpirometryValue(raw.fev1);
  const fvc = normalizeSpirometryValue(raw.fvc);
  const pefr = normalizeSpirometryValue(raw.pefr);
  const fef2575 = normalizeSpirometryValue(raw.fef2575);
  const fev6 = normalizeSpirometryValue(raw.fev6);

  // Compute FEV1/FVC ratio
  const fev1_fvc = fev1 !== null && fvc !== null && fvc !== 0
    ? Number((fev1 / fvc).toFixed(2))
    : null;

  // GLI-2012 for FEV1, FVC, and ratio
  const fev1Gli = fev1 !== null
    ? calculateGli2012(fev1, demo, 'FEV1')
    : { predicted: null, lln: null, zScore: null, percentPredicted: null };

  const fvcGli = fvc !== null
    ? calculateGli2012(fvc, demo, 'FVC')
    : { predicted: null, lln: null, zScore: null, percentPredicted: null };

  const ratioGli = fev1_fvc !== null
    ? calculateGli2012(fev1_fvc, demo, 'FEV1FVC')
    : { predicted: null, lln: null, zScore: null, percentPredicted: null };

  return {
    // --- Metadata ---
    id: raw.id,
    observation_id: raw.observation_id,
    dbdate: raw.dbdate,
    is_post_bronchodilator: raw.is_post_bronchodilator,

    // --- Observed values (L, L/s) ---
    fev1,
    fvc,
    fev1_fvc,
    pefr,
    fef2575,
    fev6,

    // FET is not stored in portal_spirometry — leave null unless you add it
    fet: raw.fet ?? null,

    // --- GLI-2012: FEV1 ---
    lln_fev1: fev1Gli.lln,
    zscore_fev1: fev1Gli.zScore,
    pred_fev1: fev1Gli.predicted,
    pred_percent_fev1: fev1Gli.percentPredicted,

    // --- GLI-2012: FVC ---
    lln_fvc: fvcGli.lln,
    zscore_fvc: fvcGli.zScore,
    pred_fvc: fvcGli.predicted,
    pred_percent_fvc: fvcGli.percentPredicted,

    // --- GLI-2012: FEV1/FVC ---
    lln_fev1_fvc: ratioGli.lln,
    zscore_fev1_fvc: ratioGli.zScore,
    pred_fev1_fvc: ratioGli.predicted,
    pred_percent_fev1_fvc: ratioGli.percentPredicted,

    // --- Test quality (from portal_spirometry) ---
    fev1_acceptability: raw.fev1_acceptability ?? null,
    fvc_acceptability: raw.fvc_acceptability ?? null,

    // --- Curves (raw rows carried through for chart generation) ---
    flows: raw.flows || [],
    volumes: raw.volumes || [],
  };
}

module.exports = { enrichSpirometry, buildDemographics };