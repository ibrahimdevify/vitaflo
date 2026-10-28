const { ValidationError } = require('../../services/patientService');
const ALLOWED_TABS = ['patient-info', 'spirometry', 'analysis', 'session-comparison', 'reports', 'billing', 'alerts'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new ValidationError(`${fieldName} must be a positive integer`);
  return parsed;
}
function parseDateParam(value, fieldName) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) throw new ValidationError(`${fieldName} must be a valid date in YYYY-MM-DD format`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new ValidationError(`${fieldName} is not a valid date`);
  return parsed;
}
function ensureRangeOrdered(startDate, endDate) {
  if (startDate > endDate) throw new ValidationError('startDate must be before or equal to endDate');
}
function buildTabParams(tab, userId, query) {
  switch (tab) {
    case 'patient-info':
    case 'alerts': return { userId };
    case 'spirometry': {
      // Keep existing JSON tab semantics intact; PDF uses range in controller.
      if (query.date && !query.startDate && !query.endDate) return { userId, date: query.date };
      const startDate = parseDateParam(query.startDate, 'startDate');
      const endDate = parseDateParam(query.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      return { userId, startDate, endDate };
    }
    case 'analysis': {
      const startDate = parseDateParam(query.startDate, 'startDate');
      const endDate = parseDateParam(query.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      return { userId, startDate, endDate, variable: query.variable || 'FEV1' };
    }
    case 'session-comparison':
      return { userId, sessionId1: parsePositiveInt(query.sessionId1, 'sessionId1'), sessionId2: parsePositiveInt(query.sessionId2, 'sessionId2') };
    case 'reports':
    case 'billing': {
      const startDate = parseDateParam(query.startDate, 'startDate');
      const endDate = parseDateParam(query.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      return { userId, startDate, endDate };
    }
    default: throw new ValidationError(`Unsupported tab: ${tab}`);
  }
}
module.exports = { ALLOWED_TABS, DATE_REGEX, parsePositiveInt, parseDateParam, ensureRangeOrdered, buildTabParams };