/**
 * Translate the SAME shared clinical calculations used by the clinician portal
 * into the Flutter best_spirometries schema.
 * Do not recompute reference values or change units here.
 */
'use strict';

function bestMetric(observed, calculated) {
  return {
    observed: observed ?? null,
    predicted: {
      gli: {
        value: calculated?.predicted ?? null,
        lln: calculated?.lln ?? null,
        zscore: calculated?.zScore ?? null,
        // Optional additive field: exact percent from the same LMS median.
        // The Flutter UI can display this instead of recomputing using a
        // predicted value already rounded to two decimal places.
        percentPredicted: calculated?.percentPredicted ?? null,
      },
    },
  };
}

function buildMobileBestResult(best, calculated) {
  const ratio = best?.fev1FvcRatio ?? null;
  // Match the Web's displayed observed ratio (0-1 scale, 2 dp).
  const observedRatio = ratio == null ? null : Number(ratio.toFixed(2));
  return {
    fev1: bestMetric(best?.fev1, calculated?.fev1),
    fvc: bestMetric(best?.fvc, calculated?.fvc),
    fev1fvc: bestMetric(observedRatio, calculated?.fev1fvc),
    fef2575: bestMetric(best?.fef2575, calculated?.fef2575),
    fev6: bestMetric(best?.fev6, calculated?.fev6),
    pefr: bestMetric(best?.pefr, calculated?.pefr),
  };
}

module.exports = { buildMobileBestResult };
