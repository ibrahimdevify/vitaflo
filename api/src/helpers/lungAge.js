// src/helpers/lungAge.js

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Estimate lung age from FEV1 (liters), height (cm), and sex.
 *
 * Uses Morris & Temple (1985) reference equations, solved for age.
 * This is the same family of equations used in many commercial
 * spirometers and the PLATINO study.
 *
 * NOTE:
 *  - These reference equations are validated for adults (~25-85 yrs).
 *  - For patients under ~20 the "lung age" concept is not meaningful;
 *    we return null rather than emit a nonsensical negative/child age.
 *  - FEV1 must be in LITERS. If your DB stores scaled integers
 *    (e.g. 338 => 3.38), normalize BEFORE calling this.
 *
 * @param {number} fev1        FEV1 in liters
 * @param {number} heightCm    Height in centimeters
 * @param {string} gender      "M" | "F" (case-insensitive)
 * @returns {number|null}      Estimated lung age in whole years
 */
const calcLungAge = (fev1, heightCm, gender) => {
  const f = toNumber(fev1);
  const h = toNumber(heightCm);

  if (f === null || h === null || f <= 0 || h <= 0) {
    return null;
  }

  const sex = String(gender || "M").trim().toUpperCase();
  const isFemale = sex === "F" || sex === "FEMALE";

  let age;

  if (isFemale) {
    // FEV1 = 0.089*H - 0.025*Age - 3.478
    age = (0.089 * h - 3.478 - f) / 0.025;
  } else {
    // FEV1 = 0.091*H - 0.032*Age - 3.364
    age = (0.091 * h - 3.364 - f) / 0.032;
  }

  if (!Number.isFinite(age)) {
    return null;
  }

  // Clamp to a plausible adult range. Negative or pediatric values
  // indicate the input isn't clinically meaningful for lung-age.
  if (age < 18 || age > 100) {
    return null;
  }

  return Math.round(age);
};

module.exports = { calcLungAge };