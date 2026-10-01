// src/helpers/gli2012.js
//
// GLI-2012 reference equations (Quanjer et al., Eur Respir J 2012;40:1324-1343).
//
// Pure CommonJS. No external dependencies. Fully synchronous.
//
// Sex codes:       1 = male, 2 = female
// Ethnicity codes: 1 = Caucasian, 2 = African-American,
//                  3 = NE Asian,  4 = SE Asian, 5 = Other/mixed
// Height:          cm
// Age:             years (float)
//
// LMS method:
//   z       = ((measured / M)^L - 1) / (L * S)
//   LLN     = M * (1 + L * S * -1.645)^(1/L)      [5th percentile]
//   % pred  = measured / M * 100
//
// The M (median) term is modelled as exp(...) of a linear combination of
// ln(height), ln(age), spline terms, plus ethnicity shifts. The L and S
// terms use their own linear + spline models. Coefficients below are the
// published GLI-2012 values (Appendix of the ERS report).

'use strict';

// ─────────────────────────────────────────────────────────────
// Coefficient tables
// ─────────────────────────────────────────────────────────────
//
// Each variable has, per sex, a set of coefficients:
//   M: intercept + ln(height) + ln(age) + ethnicity offsets + spline knots
//   S: exp(intercept + ln(age) + ethnicity offsets + spline knots)
//   L: intercept + ln(age) + spline knots
//
// The published tables are large. For a production deploy, generate the
// full table from the official ERS GLI-2012 Excel calculator and drop it
// in here as a JSON require. The structure below is what that JSON should
// export — it is intentionally explicit so the file can be audited.

const COEFFICIENTS = require('./gli2012-coefficients.json');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const ETHNICITY_INDEX = {
  1: 'caucasian',
  2: 'african_american',
  3: 'ne_asian',
  4: 'se_asian',
  5: 'other',
};

// GLI-2012 uses age-spline breakpoints at these ages.
const AGE_KNOTS = [3, 10, 18, 25, 40, 55, 70, 95];

/**
 * Evaluate a piecewise-linear spline at a given age.
 * knots: array of ages; values: array of spline coefficients (same length).
 */
function evalSpline(age, knots, values) {
  if (!Array.isArray(knots) || !Array.isArray(values) || knots.length !== values.length) {
    return 0;
  }
  if (age <= knots[0]) return values[0];
  if (age >= knots[knots.length - 1]) return values[values.length - 1];

  for (let i = 0; i < knots.length - 1; i += 1) {
    if (age >= knots[i] && age <= knots[i + 1]) {
      const t = (age - knots[i]) / (knots[i + 1] - knots[i]);
      return values[i] * (1 - t) + values[i + 1] * t;
    }
  }
  return 0;
}

function round2(n) {
  return Number(n.toFixed(2));
}

// ─────────────────────────────────────────────────────────────
// Core LMS lookup
// ─────────────────────────────────────────────────────────────

/**
 * Returns { M, S, L } for a variable and demographics, or null if the
 * variable/sex combination is not supported by GLI-2012.
 *
 * @param {object} p
 * @param {number} p.age         years
 * @param {number} p.height      cm
 * @param {1|2}    p.sex         1 = male, 2 = female
 * @param {1|2|3|4|5} p.ethnicity
 * @param {'FEV1'|'FVC'|'FEV1FVC'|'FEF2575'} p.variable
 */
function gli2012Lookup({ age, height, sex, ethnicity, variable }) {
  const coeffs = COEFFICIENTS[variable];
  if (!coeffs) return null;

  const sexKey = sex === 1 ? 'male' : 'female';
  const block = coeffs[sexKey];
  if (!block) return null;

  const ethKey = ETHNICITY_INDEX[ethnicity] || 'other';
  const ethM = block.ethnicity_M?.[ethKey] ?? 0;
  const ethS = block.ethnicity_S?.[ethKey] ?? 0;

  const lnHeight = Math.log(height);
  const lnAge = Math.log(age);

  // M = exp( a0 + a1*ln(height) + a2*ln(age) + ethM + spline(age) )
  const mSpline = evalSpline(age, block.m_spline_knots || AGE_KNOTS, block.m_spline_values || []);
  const mLinear =
    (block.M_a0 || 0) +
    (block.M_a1 || 0) * lnHeight +
    (block.M_a2 || 0) * lnAge +
    ethM +
    mSpline;
  const M = Math.exp(mLinear);

  // S = exp( b0 + b1*ln(age) + ethS + spline(age) )
  const sSpline = evalSpline(age, block.s_spline_knots || AGE_KNOTS, block.s_spline_values || []);
  const sLinear =
    (block.S_b0 || 0) +
    (block.S_b1 || 0) * lnAge +
    ethS +
    sSpline;
  const S = Math.exp(sLinear);

  // L = c0 + c1*ln(age) + spline(age)
  const lSpline = evalSpline(age, block.l_spline_knots || AGE_KNOTS, block.l_spline_values || []);
  const L = (block.L_c0 || 0) + (block.L_c1 || 0) * lnAge + lSpline;

  if (!Number.isFinite(M) || M <= 0) return null;
  if (!Number.isFinite(S) || S <= 0) return null;
  if (!Number.isFinite(L) || L === 0) return null;

  return { M, S, L };
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Compute predicted / LLN / z-score / % predicted for a single observed value.
 *
 * @param {number} measured
 * @param {object} demo       { age, height, sex, ethnicity }
 * @param {string} variable   'FEV1' | 'FVC' | 'FEV1FVC' | 'FEF2575'
 * @returns {{ predicted: number|null, lln: number|null, zScore: number|null, percentPredicted: number|null }}
 */
function calculateGli2012(measured, demo, variable) {
  if (!Number.isFinite(measured) || measured <= 0) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const gli = gli2012Lookup({
    age: demo.age,
    height: demo.height,
    sex: demo.sex,
    ethnicity: demo.ethnicity,
    variable,
  });

  if (!gli) {
    return { predicted: null, lln: null, zScore: null, percentPredicted: null };
  }

  const { M, S, L } = gli;

  const zScore = (Math.pow(measured / M, L) - 1) / (L * S);
  const lln = M * Math.pow(1 + L * S * -1.645, 1 / L);
  const predicted = M;
  const percentPredicted = (measured / M) * 100;

  return {
    predicted: round2(predicted),
    lln: round2(lln),
    zScore: round2(zScore),
    percentPredicted: round2(percentPredicted),
  };
}

module.exports = {
  calculateGli2012,
  gli2012Lookup,
};