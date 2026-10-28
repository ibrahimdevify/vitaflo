'use strict';
const { gli2012Lookup } = require('./gli2012');
const round = v => v == null || !Number.isFinite(v) ? null : Number(v.toFixed(2));
function percentile({M,L,S}, z) {
  if (Math.abs(L) < 1e-10) return M * Math.exp(S * z);
  const base = 1 + z * L * S;
  return base > 0 ? M * Math.pow(base, 1 / L) : null;
}
function referencePrediction(demo, variable) {
  const empty = { predicted: null, lln: null, uln: null };
  if (!demo) return empty;
  const lms = gli2012Lookup({ ...demo, variable });
  if (!lms) return empty;
  return {
    predicted: round(lms.M),
    lln: round(percentile(lms, -1.645)),
    uln: round(percentile(lms, 1.645)),
  };
}
module.exports = { referencePrediction, percentile };
