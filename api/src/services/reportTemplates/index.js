const { buildPatientInfoHtml } = require('./patientInfo');
const { buildSpirometryHtml } = require('./spirometry');
const { buildAnalysisHtml } = require('./analysis');
const { buildSessionComparisonHtml } = require('./sessionComparison');
const { buildReportsHtml } = require('./reports');
const { buildBillingHtml } = require('./billing');
const { buildAlertsHtml } = require('./alerts');

module.exports = {
  'patient-info': buildPatientInfoHtml,
  spirometry: buildSpirometryHtml,
  analysis: buildAnalysisHtml,
  'session-comparison': buildSessionComparisonHtml,
  reports: buildReportsHtml,
  billing: buildBillingHtml,
  alerts: buildAlertsHtml,
};