const patientService = require('../services/patientService');
const reportService = require('../services/reportService');
const { ValidationError } = patientService;
const { ALLOWED_TABS, parsePositiveInt, parseDateParam, ensureRangeOrdered, buildTabParams } = require('./helpers/patientTabParams');

const ALL_TIME_START = '2000-01-01';
const todayISO = () => new Date().toISOString().slice(0, 10);

function resolveReportRequest(tab, query) {
  switch (tab) {
    case 'spirometry': {
      const isAllTime = !query.startDate && !query.endDate && !query.date;
      const start = query.date || query.startDate || ALL_TIME_START;
      const end = query.date || query.endDate || todayISO();
      const startDate = parseDateParam(start, 'startDate');
      const endDate = parseDateParam(end, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      if (query.date && (query.startDate || query.endDate)) {
        throw new ValidationError('Use date or startDate/endDate, not both');
      }
      return { effectiveTab: 'spirometry', query: { startDate: start, endDate: end }, isAllTime };
    }
    case 'analysis':
    case 'reports':
    case 'billing': {
      const isAllTime = !query.startDate && !query.endDate;
      return { effectiveTab: tab, query: { ...query, startDate: query.startDate || ALL_TIME_START, endDate: query.endDate || todayISO() }, isAllTime };
    }
    default: return { effectiveTab: tab, query, isAllTime: false };
  }
}

// Existing route: router.get('/:id/report', patientReportController.getPatientReportPdf);
async function getPatientReportPdf(req, res) {
  try {
    const userId = parsePositiveInt(req.params.id, 'id');
    const tab = req.query.tab;
    if (!ALLOWED_TABS.includes(tab)) {
      return res.status(400).json({ error: `tab must be one of: ${ALLOWED_TABS.join(', ')}` });
    }
    const patient = await patientService.ensurePatientExists(userId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    // IMPORTANT: keep your pre-existing authorization middleware/checks in place.
    const { effectiveTab, query: normalizedQuery, isAllTime } = resolveReportRequest(tab, req.query);
    let pdfBuffer;
    if (effectiveTab === 'spirometry') {
      const startDate = parseDateParam(normalizedQuery.startDate, 'startDate');
      const endDate = parseDateParam(normalizedQuery.endDate, 'endDate');
      ensureRangeOrdered(startDate, endDate);
      // Repository's endDate range behavior must be checked for inclusivity.
      // Add an inclusive end-of-day bound so DATETIME results on endDate are retained.
      const endOfDay = new Date(endDate.getTime() + 86400000 - 1);
      const data = await patientService.getLegacySpirometryPdfData(userId, { startDate, endDate: endOfDay });
      pdfBuffer = await reportService.generateLegacySpirometryPdf(data);
    } else {
      const params = buildTabParams(effectiveTab, userId, normalizedQuery);
      const [data, patientInfo] = await Promise.all([
        patientService.getPatientTabData(effectiveTab, params),
        patientService.getPatientTabData('patient-info', { userId }).catch(() => null),
      ]);
      const meta = {
        patientName: patientInfo ? patientInfo.name : `Patient #${userId}`,
        clinicianName: (req.user && `${req.user.f_name || ''} ${req.user.l_name || ''}`.trim()) || undefined,
        isAllTime,
      };
      pdfBuffer = await reportService.generateTabReportPdf(effectiveTab, data, meta);
    }
    const safeTab = tab.replace(/[^a-z0-9-]/gi, '');
    const filenameSuffix = isAllTime ? '-all' : '';
    const isInline = req.query.download !== '1';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="patient-${userId}-${safeTab}${filenameSuffix}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
    if (reportService.ReportError && error instanceof reportService.ReportError) return res.status(400).json({ error: error.message });
    console.error('Get patient report PDF error:', error);
    return res.status(500).json({ error: 'Failed to generate patient report PDF' });
  }
}
module.exports = { getPatientReportPdf };