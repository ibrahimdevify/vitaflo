const patientService = require('../services/patientService');

const { ValidationError } = patientService;
const ALLOWED_TABS = ['patient-info', 'spirometry', 'analysis', 'session-comparison', 'reports', 'billing', 'alerts'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

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

/**
 * startDate/endDate are optional on every list tab now (no default filter except Spirometry,
 * which is applied in the service layer). If either is supplied, both must be, and in order.
 */
function parseOptionalDateRange(query) {
  const hasStart = query.startDate !== undefined && query.startDate !== '';
  const hasEnd = query.endDate !== undefined && query.endDate !== '';

  if (hasStart !== hasEnd) {
    throw new ValidationError('startDate and endDate must be provided together');
  }
  if (!hasStart) {
    return { startDate: undefined, endDate: undefined };
  }

  const startDate = parseDateParam(query.startDate, 'startDate');
  const endDate = parseDateParam(query.endDate, 'endDate');
  ensureRangeOrdered(startDate, endDate);
  return { startDate, endDate };
}

function parsePagination(query) {
  const page = query.page !== undefined ? parsePositiveInt(query.page, 'page') : 1;
  const limitRaw = query.limit !== undefined ? parsePositiveInt(query.limit, 'limit') : DEFAULT_PAGE_SIZE;
  const limit = Math.min(limitRaw, MAX_PAGE_SIZE);
  return { page, limit };
}

function buildTabParams(tab, userId, query) {
  switch (tab) {
    case 'patient-info':
      return { userId };

    case 'spirometry': {
      const { startDate, endDate } = parseOptionalDateRange(query);
      const { page, limit } = parsePagination(query);
      return { userId, startDate, endDate, page, limit };
    }

    case 'analysis': {
      const { startDate, endDate } = parseOptionalDateRange(query);
      return { userId, startDate, endDate, variable: query.variable || 'FEV1' };
    }

    case 'session-comparison': {
      const sessionId1 = parsePositiveInt(query.sessionId1, 'sessionId1');
      const sessionId2 = parsePositiveInt(query.sessionId2, 'sessionId2');
      return { userId, sessionId1, sessionId2 };
    }

    case 'reports':
    case 'billing':
    case 'alerts': {
      const { startDate, endDate } = parseOptionalDateRange(query);
      const { page, limit } = parsePagination(query);
      return { userId, startDate, endDate, page, limit };
    }

    default:
      throw new ValidationError(`Unsupported tab: ${tab}`);
  }
}

const getPatientById = async (req, res) => {
  try {
    const userId = parsePositiveInt(req.params.id, 'id');
    const tab = req.query.tab;

    if (!ALLOWED_TABS.includes(tab)) {
      return res.status(400).json({ error: `tab must be one of: ${ALLOWED_TABS.join(', ')}` });
    }

    const patient = await patientService.ensurePatientExists(userId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const params = buildTabParams(tab, userId, req.query);
    const data = await patientService.getPatientTabData(tab, params);

    return res.json({ tab, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Get patient error:', error);
    return res.status(500).json({ error: 'Failed to fetch patient data' });
  }
};

const listPatients = async (req, res) => {
  try {
    const patients = await patientService.getPatientsList();
    return res.json({ data: patients });
  } catch (error) {
    console.error('List patients error:', error);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

module.exports = { getPatientById, listPatients };