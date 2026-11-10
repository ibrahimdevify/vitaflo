import { spirometryAPI } from '../../../services/api';

/** Keep PDF downloading consistent across Spirometry and Session Comparison. */
export async function downloadObservationPdf(observationId) {
  const id = Number(observationId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid observation ID');
  const response = await spirometryAPI.getReportPDF(id);
  const pdf = response.data instanceof Blob
    ? response.data : new Blob([response.data], { type: 'application/pdf' });
  const contentType = response.headers?.['content-type'] || pdf.type || '';
  if (!String(contentType).toLowerCase().includes('application/pdf')) {
    let message = 'Unable to generate spirometry PDF';
    try {
      const errorBody = JSON.parse(await pdf.text());
      message = errorBody.error || errorBody.message || message;
    } catch { /* Non-JSON response */ }
    throw new Error(message);
  }
  const url = URL.createObjectURL(pdf);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `spirometry_report_${id}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function getPdfErrorMessage(error) {
  const responseBody = error?.response?.data;
  if (responseBody instanceof Blob) {
    try {
      const parsed = JSON.parse(await responseBody.text());
      return parsed.error || parsed.message || error?.message || 'PDF download failed';
    } catch { /* Keep initial error */ }
  }
  return error?.message || 'PDF download failed';
}
