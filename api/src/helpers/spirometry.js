// src/helpers/spirometry.js

/**
 * IMPORTANT:
 *
 * Raw/scaled DB values:
 *   325 -> 3.25
 *   410 -> 4.10
 *
 * keep this as 100.
 *
 * Already-decimal values:
 *   3.25 -> 3.25
 *   4.10 -> 4.10
 *
 * are automatically kept as-is by normalizeSpirometryValue().
 */
const RAW_SPIROMETRY_SCALE_FACTOR = 100;


/**
 * Convert value to number or null.
 */
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
 *
 * Old/scaled format:
 *   338 -> 3.38
 *   482 -> 4.82
 *   1009 -> 10.09
 *
 * Already-decimal format:
 *   2.48 -> 2.48
 *   2.55 -> 2.55
 *
 * RAW_SPIROMETRY_SCALE_FACTOR remains 100.
 */
const normalizeSpirometryValue = (rawValue) => {
  const value = toNumberOrNull(rawValue);

  if (value === null) {
    return null;
  }

  /**
   * Values >= 20 are treated as old/scaled values.
   *
   * Examples:
   *   338 -> 3.38
   *   482 -> 4.82
   *   1009 -> 10.09
   *
   * Normal decimal spirometry values such as:
   *   2.48
   *   2.55
   * remain unchanged.
   */
  if (
    Math.abs(value) >=
    RAW_SPIROMETRY_SCALE_FACTOR / 5
  ) {
    return Number(
      (
        value / RAW_SPIROMETRY_SCALE_FACTOR
      ).toFixed(2)
    );
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
    fvc: firstDefined(
      val.fvcL,
      val.fvc
    ),

    fev1: firstDefined(
      val.fev1L,
      val.fev1
    ),

    pefr: firstDefined(
      val.pefLs,
      val.pefr
    ),

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

    btps: firstDefined(
      val.btps
    ),

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
 * Calculate predicted values.
 *
 * IMPORTANT:
 * Input may be a raw DB value.
 *
 * Example:
 *
 *   338
 *     ↓ normalize
 *   3.38
 *     ↓ predicted calculation
 *   3.98
 */
const calculatePredictedValues = (rawValue) => {
  const value =
    normalizeSpirometryValue(rawValue);

  if (
    value === null ||
    value <= 0
  ) {
    return {
      predicted: null,
      lln: null,
      zScore: null,
      percentPredicted: null,
    };
  }

  const predicted = Number(
    (
      value / 0.85
    ).toFixed(2)
  );

  const lln = Number(
    (
      value * 0.8
    ).toFixed(2)
  );

  const zScore = 0.1;

  const percentPredicted = Number(
    (
      (value / predicted) *
      100
    ).toFixed(2)
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
 * Values are normalized first.
 *
 * Example:
 *
 *   FEV1 = 338 -> 3.38
 *   FVC  = 482 -> 4.82
 *
 *   3.38 / 4.82 * 100 = 70.1
 */
const calculateFev1FvcRatio = (
  fev1,
  fvc
) => {
  const normalizedFev1 =
    normalizeSpirometryValue(fev1);

  const normalizedFvc =
    normalizeSpirometryValue(fvc);

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
      fev1FvcRatio !== null &&
      fev1FvcRatio !== undefined
        ? Number(
            (
              (
                (fev1FvcRatio / 100) /
                0.83
              ) * 100
            ).toFixed(2)
          )
        : null,
  };
};


/**
 * Normalize one stored spirometry record.
 *
 * This ensures fetching APIs get the same normalized values.
 */
const normalizeSpirometry = (
  sp = {}
) => {
  const fev1 =
    normalizeSpirometryValue(
      sp.fev1
    );

  const fvc =
    normalizeSpirometryValue(
      sp.fvc
    );

  const pefr =
    normalizeSpirometryValue(
      sp.pefr
    );

  const fef2575 =
    normalizeSpirometryValue(
      sp.fef2575
    );

  const fev6 =
    normalizeSpirometryValue(
      sp.fev6
    );

  const fev1FvcRatio =
    calculateFev1FvcRatio(
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

    // Keep stored percentage unchanged.
    fev1_perc:
      toNumberOrNull(
        sp.fev1_perc
      ),

    fev1_fvc_ratio:
      fev1FvcRatio,
  };
};


/**
 * Build predicted data for normalized spirometry.
 */
const buildPredictedSpirometry = (
  sp = {}
) => {
  const normalized =
    normalizeSpirometry(sp);

  return {
    fev1:
      calculatePredictedValues(
        normalized.fev1
      ),

    fvc:
      calculatePredictedValues(
        normalized.fvc
      ),

    fev1_fvc:
      calculateFev1FvcPredictedValues(
        normalized.fev1_fvc_ratio
      ),

    fef2575:
      calculatePredictedValues(
        normalized.fef2575
      ),

    fev6:
      calculatePredictedValues(
        normalized.fev6
      ),

    pefr:
      calculatePredictedValues(
        normalized.pefr
      ),
  };
};


/**
 * Select best spirometry.
 *
 * Primary:
 *   highest FEV1
 *
 * Fallback:
 *   highest FVC
 */
const pickBestSpirometry = (
  spirometries = []
) => {
  const normalized =
    spirometries
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

      if (
        currentFev1 > bestFev1
      ) {
        return current;
      }

      if (
        currentFev1 < bestFev1
      ) {
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