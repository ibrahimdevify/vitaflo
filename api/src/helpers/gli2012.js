'use strict';

const COEFFICIENTS = require('./gli2012-coefficients.json');

// Official GLI equation uses ONE age-specific spline value (interpolated).
// In the supplied coefficient table, m0/s0/l0 are the current age row and
// m1/s1/l1 are the next-age endpoints. The previous code ADDED m0+m1,
// s0+s1 and l0+l1, which incorrectly doubled spline terms.
const ETHNICITY_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
const empty = () => ({ predicted: null, lln: null, zScore: null, percentPredicted: null });
const round2 = (n) => Number(n.toFixed(2));

function interpolateRow(rows, age) {
  if (!Array.isArray(rows) || rows.length === 0 || !Number.isFinite(age)) return null;
  if (age < rows[0].age || age > rows[rows.length - 1].age) return null;
  if (age === rows[rows.length - 1].age) {
    const last = rows[rows.length - 1];
    return { ...last, mSpline: last.m0, sSpline: last.s0, lSpline: last.l0 };
  }

  let i = 0;
  while (i < rows.length - 1 && age > rows[i + 1].age) i++;
  const lo = rows[i], hi = rows[i + 1];
  if (!lo || !hi || hi.age <= lo.age) return null;
  const t = (age - lo.age) / (hi.age - lo.age);
  const lerp = (x, y) => x + (y - x) * t;
  const result = { age };
  const keys = ['a0','a1','a2','a3','a4','a5','a6',
    'p0','p1','p2','p3','p4','p5','q0','q1'];
  for (const key of keys) result[key] = lerp(lo[key], hi[key]);
  // Read a SINGLE spline value interpolated between the age endpoints.
  result.mSpline = lerp(lo.m0, lo.m1);
  result.sSpline = lerp(lo.s0, lo.s1);
  result.lSpline = lerp(lo.l0, lo.l1);
  return result;
}

function gli2012Lookup({ age, height, sex, ethnicity, variable }) {
  if (!Number.isFinite(age) || age < 3 || age > 95 ||
      !Number.isFinite(height) || height < 65 || height > 230 ||
      ![1, 2].includes(sex) || ![1, 2, 3, 4, 5].includes(ethnicity)) return null;
  const table = COEFFICIENTS[variable];
  if (!table) return null;
  const row = interpolateRow(sex === 1 ? table.male : table.female, age);
  if (!row) return null;
  const E = [0, 0, 0, 0, 0];
  const idx = ETHNICITY_INDEX[ethnicity];
  if (idx >= 1) E[idx] = 1;
  const lnHeight = Math.log(height);
  const lnAge = Math.log(age);
  const mLinear = row.a0 + row.a1 * lnHeight + row.a2 * lnAge +
    row.a3 * E[1] + row.a4 * E[2] + row.a5 * E[3] + row.a6 * E[4] + row.mSpline;
  const sLinear = row.p0 + row.p1 * lnAge +
    row.p2 * E[1] + row.p3 * E[2] + row.p4 * E[3] + row.p5 * E[4] + row.sSpline;
  const M = Math.exp(mLinear);
  const S = Math.exp(sLinear);
  const L = row.q0 + row.q1 * lnAge + row.lSpline;
  if (!Number.isFinite(M) || M <= 0 || !Number.isFinite(S) || S <= 0 || !Number.isFinite(L)) return null;
  return { M, S, L };
}

function calculateGli2012(measured, demo, variable) {
  if (!Number.isFinite(measured) || measured <= 0 || !demo) return empty();
  const lms = gli2012Lookup({ ...demo, variable });
  if (!lms) return empty();
  const { M, S, L } = lms;
  const ratio = measured / M;
  const zScore = Math.abs(L) < 1e-10 ? Math.log(ratio) / S :
    (Math.pow(ratio, L) - 1) / (L * S);
  const llnBase = 1 - 1.645 * L * S;
  const lln = Math.abs(L) < 1e-10 ? M * Math.exp(-1.645 * S) :
    llnBase > 0 ? M * Math.pow(llnBase, 1 / L) : null;
  if (![M, zScore, lln].every(Number.isFinite)) return empty();
  return {
    predicted: round2(M),
    lln: round2(lln),
    zScore: round2(zScore),
    percentPredicted: round2((measured / M) * 100),
  };
}

module.exports = { calculateGli2012, gli2012Lookup, interpolateRow };
