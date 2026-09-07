
const { ValidationError } = require('../../services/patientService');

const ALLOWED_TABS = ['patient-info', 'spirometry', 'analysis', 'session-comparison', 'reports', 'billing', 'alerts'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function parseDateParam(value, fieldName) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid date in YYYY-MM-DD format`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} is not a valid date`);
  }
  return parsed;
}

function ensureRangeOrdered(startDate, endDate) {
  if (startDate > endDate) {
    throw new ValidationError('startDate must be before or equal to endDate');
  }
}

/** Builds the params object patientService.getPatientTabData(tab, params) expects, per tab. */
function buildTabParams(tab, userId, query) {
  switch (tab) {
    case 'patient-info':
    case 'alerts':
      return { userId };

    case 'spirometry': {
      if (!query.date || !DATE_REGEX.test(query.date)) {
        throw new ValidationError('date (YYYY-MM-DD) is required for the spirometry tab');
      }
      return { userId, date: query.date };
    }

    case 'analysis': {
      const startDate = parseDateParam(query.startDate, 'startDate');
      const endDate = parseDateParam(query.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      return { userId, startDate, endDate, variable: query.variable || 'FEV1' };
    }

    case 'session-comparison': {
      const sessionId1 = parsePositiveInt(query.sessionId1, 'sessionId1');
      const sessionId2 = parsePositiveInt(query.sessionId2, 'sessionId2');
      return { userId, sessionId1, sessionId2 };
    }

    case 'reports':
    case 'billing': {
      const startDate = parseDateParam(query.startDate, 'startDate');
      const endDate = parseDateParam(query.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      return { userId, startDate, endDate };
    }

    default:
      throw new ValidationError(`Unsupported tab: ${tab}`);
  }
}

module.exports = {
  ALLOWED_TABS,
  DATE_REGEX,
  parsePositiveInt,
  parseDateParam,
  ensureRangeOrdered,
  buildTabParams,
};