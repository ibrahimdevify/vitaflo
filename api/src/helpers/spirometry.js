// src/helpers/spirometry.js

/**
 * IMPORTANT:
 * Set this according to the actual values stored in portal_spirometry.
 *
 * If DB stores:
 *   325 -> 3.25
 *   410 -> 4.10
 *
 * keep this as 100.
 *
 * If DB already stores:
 *   3.25
 *   4.10
 *
 * change this to 1.
 */
const RAW_SPIROMETRY_SCALE_FACTOR = 100;

const toNumberOrNull = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
};


/**
 * Normalize raw DB spirometry value.
 */
const normalizeSpirometryValue = (rawValue) => {
  if (
    rawValue === null ||
    rawValue === undefined ||
    rawValue === ""
  ) {
    return null;
  }

  const value = Number(rawValue);

  if (Number.isNaN(value)) {
    return null;
  }

  // Old/scaled format:
  // 338 -> 3.38
  // 482 -> 4.82
  //
  // New format:
  // 2.48 -> 2.48
  // 2.55 -> 2.55
  if (Math.abs(value) >= 20) {
    return Number((value / 100).toFixed(2));
  }

  return Number(value.toFixed(2));
};


/**
 * Convert incoming sync data to DB format.
 *
 * Supports both:
 *   fvcL / fvc
 *   fev1L / fev1
 *   pefLs / pefr
 *   fef2575Ls / fef2575
 *   fev6L / fev6
 *   fev1Perc / fev1_perc
 */
const mapSpirometryInput = (val = {}) => {
  const firstDefined = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  return {
    fvc: firstDefined(val.fvcL, val.fvc),
    fev1: firstDefined(val.fev1L, val.fev1),
    pefr: firstDefined(val.pefLs, val.pefr),
    fef2575: firstDefined(
      val.fef2575Ls,
      val.fef2575
    ),
    fev6: firstDefined(
      val.fev6L,
      val.fev6
    ),
    fev1_perc: firstDefined(
      val.fev1Perc,
      val.fev1_perc
    ),
    btps: firstDefined(val.btps),
    temp_celsius: firstDefined(
      val.tempCelsius,
      val.temp_celsius
    ),
    quality_message: firstDefined(
      val.qualityMessage,
      val.quality_message
    ),
  };
};


/**
 * Old getResults predicted-value calculation.
 */
const calculatePredictedValues = (observedValue) => {
  const value = toNumberOrNull(observedValue);

  if (value === null || value <= 0) {
    return {
      predicted: null,
      lln: null,
      zScore: null,
      percentPredicted: null,
    };
  }

  const predicted = Number(
    (value / 0.85).toFixed(2)
  );

  const lln = Number(
    (value * 0.8).toFixed(2)
  );

  const zScore = 0.1;

  const percentPredicted = Number(
    ((value / predicted) * 100).toFixed(2)
  );

  return {
    predicted,
    lln,
    zScore,
    percentPredicted,
  };
};


/**
 * FEV1/FVC calculation.
 *
 * Returns percentage:
 * 3.0 / 4.0 = 75
 */
const calculateFev1FvcRatio = (fev1, fvc) => {
  const normalizedFev1 = toNumberOrNull(fev1);
  const normalizedFvc = toNumberOrNull(fvc);

  if (
    normalizedFev1 === null ||
    normalizedFvc === null ||
    normalizedFvc === 0
  ) {
    return null;
  }

  return Number(
    (
      (normalizedFev1 / normalizedFvc) *
      100
    ).toFixed(1)
  );
};


/**
 * Old API FEV1/FVC predicted values.
 */
const calculateFev1FvcPredictedValues = (
  fev1FvcRatio
) => {
  return {
    predicted: 0.83,
    lln: 0.7,
    zScore: 0.1,

    percentPredicted:
      fev1FvcRatio !== null
        ? Number(
            (
              ((fev1FvcRatio / 100) / 0.83) *
              100
            ).toFixed(2)
          )
        : null,
  };
};


/**
 * Normalize one stored spirometry record
 * so every fetching API gets the same values.
 */
const normalizeSpirometry = (sp = {}) => {
  const fev1 = normalizeSpirometryValue(sp.fev1);
  const fvc = normalizeSpirometryValue(sp.fvc);
  const pefr = normalizeSpirometryValue(sp.pefr);
  const fef2575 = normalizeSpirometryValue(sp.fef2575);
  const fev6 = normalizeSpirometryValue(sp.fev6);

  const fev1FvcRatio = calculateFev1FvcRatio(
    fev1,
    fvc
  );

  return {
    ...sp,

    fev1,
    fvc,
    pefr,
    fef2575,
    fev6,

    // Keep this as stored percentage.
    fev1_perc:
      toNumberOrNull(sp.fev1_perc),

    fev1_fvc_ratio: fev1FvcRatio,
  };
};


/**
 * Build predicted data for normalized spirometry.
 */
const buildPredictedSpirometry = (sp = {}) => {
  const normalized = normalizeSpirometry(sp);

  return {
    fev1: calculatePredictedValues(
      normalized.fev1
    ),

    fvc: calculatePredictedValues(
      normalized.fvc
    ),

    fev1_fvc:
      calculateFev1FvcPredictedValues(
        normalized.fev1_fvc_ratio
      ),

    fef2575: calculatePredictedValues(
      normalized.fef2575
    ),

    fev6: calculatePredictedValues(
      normalized.fev6
    ),

    pefr: calculatePredictedValues(
      normalized.pefr
    ),
  };
};


/**
 * Select best spirometry.
 *
 * Primary criteria:
 * highest FEV1.
 *
 * Fallback:
 * highest FVC.
 */
const pickBestSpirometry = (
  spirometries = []
) => {
  const normalized = spirometries
    .map(normalizeSpirometry)
    .filter((sp) => {
      return (
        sp.fev1 !== null ||
        sp.fvc !== null ||
        sp.pefr !== null ||
        sp.fef2575 !== null ||
        sp.fev6 !== null
      );
    });

  if (!normalized.length) {
    return null;
  }

  return normalized.reduce(
    (best, current) => {
      if (!best) {
        return current;
      }

      const bestFev1 =
        best.fev1 ?? -Infinity;

      const currentFev1 =
        current.fev1 ?? -Infinity;

      if (currentFev1 > bestFev1) {
        return current;
      }

      if (currentFev1 < bestFev1) {
        return best;
      }

      const bestFvc =
        best.fvc ?? -Infinity;

      const currentFvc =
        current.fvc ?? -Infinity;

      return currentFvc > bestFvc
        ? current
        : best;
    },
    null
  );
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
};