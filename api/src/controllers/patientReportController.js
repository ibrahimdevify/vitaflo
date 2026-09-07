const patientService = require('../services/patientService');
const reportService = require('../services/reportService');
const { ValidationError } = patientService;
const { ALLOWED_TABS, parsePositiveInt, buildTabParams } = require('./helpers/patientTabParams');

/**
 * GET /patients/:id/report?tab=<tab>&...same query params as GET /patients/:id?tab=<tab>...
 *
 * One route renders any of the seven tabs to a PDF. `tab` picks both the data
 * query (via buildTabParams/getPatientTabData, identical to the JSON endpoint
 * in patientController.js) and the matching Puppeteer template (via
 * reportService -> services/reportTemplates/index.js).
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

    const params = buildTabParams(tab, userId, req.query);
    const [data, patientInfo] = await Promise.all([
      patientService.getPatientTabData(tab, params),
      // Reused purely for a friendly header/footer name; harmless if it's
      // already been fetched as part of the tab itself (e.g. tab === 'patient-info').
      patientService.getPatientTabData('patient-info', { userId }).catch(() => null),
    ]);

    const meta = {
      patientName: patientInfo ? patientInfo.name : `Patient #${userId}`,
      clinicianName: (req.user && `${req.user.f_name || ''} ${req.user.l_name || ''}`.trim()) || undefined,
    };

    const pdfBuffer = await reportService.generateTabReportPdf(tab, data, meta);

    const filenameSafeTab = tab.replace(/[^a-z0-9-]/gi, '');
    const isInline = req.query.download !== '1';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isInline ? 'inline' : 'attachment'}; filename="patient-${userId}-${filenameSafeTab}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
   
    console.error('Get patient report PDF error:', error);
    return res.status(500).json({ error: 'Failed to generate patient report PDF' });
  }
};

module.exports = { getPatientReportPdf };