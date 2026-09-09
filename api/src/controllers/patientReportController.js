const patientService = require('../services/patientService');
const reportService = require('../services/reportService');
const { ValidationError } = patientService;
const { ALLOWED_TABS, parsePositiveInt, buildTabParams } = require('./helpers/patientTabParams');

// Cheap stand-in for "the beginning of this patient's history" — avoids an
// extra query to find their actual earliest record. Combined with `today` as
// the upper bound, this covers effectively all real data for any patient.
const ALL_TIME_START = '2000-01-01';
const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * PDF requests don't require the same query params the JSON tab endpoint
 * does — omitting them means "give me everything for this tab" instead of a
 * 400. Returns the tab to actually render (which may differ from the one the
 * caller asked for) plus a query object with defaults filled in.
 */
function resolveReportRequest(tab, query) {
  switch (tab) {
    case 'spirometry': {
      if (query.date) {
        // Specific day requested — behaves exactly as before.
        return { effectiveTab: 'spirometry', query, isAllTime: false };
      }
      // No date given. "All spirometry" doesn't fit the single-day
      // Spirometry template (it's built around one day's trials) — fall
      // back to the Reports template instead: a table of every test
      // session across every date, which *is* overall spirometry.
      return {
        effectiveTab: 'reports',
        query: {
          startDate: query.startDate || ALL_TIME_START,
          endDate: query.endDate || todayISO(),
        },
        isAllTime: !query.startDate && !query.endDate,
      };
    }

    case 'analysis':
    case 'reports':
    case 'billing': {
      const isAllTime = !query.startDate && !query.endDate;
      return {
        effectiveTab: tab,
        query: {
          ...query,
          startDate: query.startDate || ALL_TIME_START,
          endDate: query.endDate || todayISO(),
        },
        isAllTime,
      };
    }

    // session-comparison inherently needs two specific sessions — no sensible
    // "overall" default, still requires sessionId1/sessionId2 as before.
    // patient-info / alerts already need nothing extra.
    default:
      return { effectiveTab: tab, query, isAllTime: false };
  }
}

/**
 * GET /patients/:id/report?tab=<tab>&...params optional, see resolveReportRequest...
 *
 * One route renders any of the seven tabs to a PDF. `tab` picks both the data
 * query (via buildTabParams/getPatientTabData, same shape the JSON endpoint
 * in patientController.js uses) and the matching Puppeteer template (via
 * reportService -> services/reportTemplates/index.js) — except unlike that
 * JSON endpoint, missing date/range params here default to "everything"
 * instead of a 400.
 *
 * Add `&download=1` to get Content-Disposition: attachment instead of inline.
 */
const getPatientReportPdf = async (req, res) => {
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

    const { effectiveTab, query: normalizedQuery, isAllTime } = resolveReportRequest(tab, req.query);

    const params = buildTabParams(effectiveTab, userId, normalizedQuery);
    const [data, patientInfo] = await Promise.all([
      patientService.getPatientTabData(effectiveTab, params),
      // Reused purely for a friendly header/footer name; harmless if it's
      // already been fetched as part of the tab itself (e.g. tab === 'patient-info').
      patientService.getPatientTabData('patient-info', { userId }).catch(() => null),
    ]);

    const meta = {
      patientName: patientInfo ? patientInfo.name : `Patient #${userId}`,
      clinicianName: (req.user && `${req.user.f_name || ''} ${req.user.l_name || ''}`.trim()) || undefined,
      isAllTime,
    };

    const pdfBuffer = await reportService.generateTabReportPdf(effectiveTab, data, meta);

    const filenameSafeTab = tab.replace(/[^a-z0-9-]/gi, '');
    const filenameSuffix = isAllTime ? '-all' : '';
    const isInline = req.query.download !== '1';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isInline ? 'inline' : 'attachment'}; filename="patient-${userId}-${filenameSafeTab}${filenameSuffix}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (reportService.ReportError && error instanceof reportService.ReportError) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Get patient report PDF error:', error);
    return res.status(500).json({ error: 'Failed to generate patient report PDF' });
  }
};

module.exports = { getPatientReportPdf };