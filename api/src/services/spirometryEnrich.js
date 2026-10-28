// src/services/spirometryEnrich.js
'use strict';

const { normalizeSpirometryValue } = require('../helpers/spirometry');
const { inspectDemographics, createCalculatedValues } = require('../helpers/spirometryParity');

/**
 * SAME demographic resolver as web patientService and mobile getResults.
 * No age=40, height=170, or default male substitutes. Provide the test date
 * (not today's date) so historical predicted values remain reproducible.
 */
function buildDemographics({ observation, attributes, details, testDate } = {}) {
  return inspectDemographics({
    attributes: attributes || {},
    details: details || {},
    observationHeight: observation?.height,
    testDate: testDate || observation?.dbdate,
  }).demo;
}

/**
 * Enrich a single raw portal_spirometry row into the shape that
 * buildSpirometryReportHtml() expects.
 *
 * All returned keys are snake_case to match the HTML template exactly.
 */
function enrichSpirometry(raw, demographics) {
  if (!raw) return null;

  // Use the shared, patient-specific GLI2012 calculator used on both APIs.
  // Do not round FEV1/FVC before its z-score is computed.
  const fev1 = normalizeSpirometryValue(raw.fev1);
  const fvc = normalizeSpirometryValue(raw.fvc);
  const pefr = normalizeSpirometryValue(raw.pefr);
  const fef2575 = normalizeSpirometryValue(raw.fef2575);
  const fev6 = normalizeSpirometryValue(raw.fev6);
  const ratio = fev1 != null && fvc > 0 ? fev1 / fvc : null;
  const fev1_fvc = ratio == null ? null : Number(ratio.toFixed(2));
  const calculated = createCalculatedValues({
    fev1, fvc, pefr, fef2575, fev6, fev1FvcRatio: ratio,
  }, demographics || null);
  const fev1Gli = calculated.fev1;
  const fvcGli = calculated.fvc;
  const ratioGli = calculated.fev1fvc;
  const fef2575Gli = calculated.fef2575;

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

    // --- FEF25–75 from the same reference equation ---
    lln_fef2575: fef2575Gli.lln,
    zscore_fef2575: fef2575Gli.zScore,
    pred_fef2575: fef2575Gli.predicted,
    pred_percent_fef2575: fef2575Gli.percentPredicted,

    // --- Test quality (from portal_spirometry) ---
    fev1_acceptability: raw.fev1_acceptability ?? null,
    fvc_acceptability: raw.fvc_acceptability ?? null,

    // --- Curves (raw rows carried through for chart generation) ---
    flows: raw.flows || [],
    volumes: raw.volumes || [],
  };
}

module.exports = { enrichSpirometry, buildDemographics };